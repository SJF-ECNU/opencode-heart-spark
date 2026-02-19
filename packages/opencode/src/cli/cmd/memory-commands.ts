/**
 * Memory CLI Commands
 *
 * CLI handlers for memory management commands.
 * Note: Some imports are lazy-loaded to avoid initialization issues during app startup.
 */

import { getMemoryStoreManager } from '../../persona/memory-integration.js';
import { viewMemories, getMemoryDates, loadMemoryFiles, getMemoryBySession } from '../../memory/memory-loader.js';
import { deleteMemory, saveMemoryToFile } from '../../memory/memory-writer.js';
import { exportMemories } from '../../memory/export.js';
import { executeFlushCommand } from '../../memory/flush-command.js';
// Lazy-loaded imports - see summarizeConversation function for full lazy loading
// MessageV2 is used in getSessionMessages which is only called when needed

/**
 * Get conversation messages for a session
 * Note: Uses dynamic import to avoid initialization issues during app startup
 */
export async function getSessionMessages(sessionId: string): Promise<string[]> {
  try {
    // Dynamic import to avoid startup issues
    const { MessageV2 } = await import('../../session/message-v2.js');

    const messages: string[] = [];
    for await (const msg of MessageV2.stream(sessionId)) {
      const parts = msg.parts
        .filter((p: any) => p.type === 'text' && !('synthetic' in p && p.synthetic))
        .map((p: any) => p.text)
        .join('\n');

      if (parts.trim()) {
        const role = msg.info.role === 'user' ? 'User' : 'Assistant';
        messages.push(`## ${role}\n${parts}`);
      }
    }
    return messages;
  } catch (error) {
    console.error('Failed to get session messages:', error);
    return [];
  }
}

/**
 * Summarize conversation using sub-agent approach
 */
export async function summarizeConversation(
  sessionId: string,
  directory?: string
): Promise<string> {
  // Dynamic imports to avoid initialization issues during startup
  const { Instance } = await import('../../project/instance.js');
  const { MessageV2 } = await import('../../session/message-v2.js');
  const { LLM } = await import('../../session/llm.js');
  const { Agent } = await import('../../agent/agent.js');
  const { Provider } = await import('../../provider/provider.js');

  // Get the directory - fallback to cwd if not provided
  const workingDir = directory || process.cwd();

  // Wrap the LLM call in Instance.provide to ensure context is available
  return Instance.provide({
    directory: workingDir,
    fn: async () => {
      try {
        // Get conversation messages
        const messages: string[] = [];
        for await (const msg of MessageV2.stream(sessionId)) {
          const parts = msg.parts
            .filter((p: any) => p.type === 'text' && !('synthetic' in p && p.synthetic))
            .map((p: any) => p.text)
            .join('\n');

          if (parts.trim()) {
            const role = msg.info.role === 'user' ? 'User' : 'Assistant';
            messages.push(`## ${role}\n${parts}`);
          }
        }

        if (messages.length === 0) {
          throw new Error('No conversation messages found');
        }

        const conversationText = messages.join('\n\n---\n\n');

        // Use LLM to summarize the conversation
        const agent = await Agent.get('general');
        if (!agent) {
          throw new Error('General agent not found');
        }

        const modelProvider = await Provider.defaultModel();
        if (!modelProvider.providerID || !modelProvider.modelID) {
          throw new Error('No default model available');
        }
        const model = await Provider.getModel(modelProvider.providerID, modelProvider.modelID);

        // Build summarization prompt
        const systemPrompt = 'Your task is to summarize the conversation into important context that should be remembered. Focus on key facts, preferences, decisions, and meaningful moments.';

        const userPrompt = `Please summarize this conversation into a concise memory that captures the essential points:

${conversationText}

Provide a summary that:
- Identifies who the user is and their key characteristics
- Notes important topics discussed
- Records any decisions or commitments made
- Captures preferences or patterns observed
- Includes any meaningful moments or highlights

Write the summary in a way that would be useful for future conversations.`;

        // Create a simple LLM call for summarization using LLM.stream
        const userMessage: any = {
          id: 'summarize-user',
          sessionID: sessionId,
          role: 'user',
          time: { created: Date.now() },
          agent: agent.name,
          model: { providerID: model.providerID, modelID: model.id },
          variant: undefined,
          system: undefined,
          format: undefined,
          tools: undefined,
        };

        const result = await LLM.stream({
          agent,
          user: userMessage,
          system: [systemPrompt],
          small: true,
          tools: {},
          model,
          abort: new AbortController().signal,
          sessionID: sessionId,
          messages: [
            { role: 'user' as const, content: userPrompt },
          ],
        });

        const text = await result.text;
        return text;
      } catch (error) {
        console.error('Failed to summarize conversation:', error);
        throw error;
      }
    }
  });
}

/**
 * View memories command
 */
export async function cmdViewMemories(args: {
  days?: number;
  type?: string;
  format?: 'plain' | 'json';
}): Promise<string> {
  const store = getMemoryStoreManager();
  if (!store || !store.isInitialized()) {
    return 'Error: Memory not initialized for this persona';
  }

  const memoryStore = store.getStore();
  if (!memoryStore) {
    return 'Error: Memory store not available';
  }

  const memories = await viewMemories(memoryStore, {
    days: args.days || 7,
    type: args.type as any,
  });

  if (memories.length === 0) {
    return 'No memories found.';
  }

  if (args.format === 'json') {
    return JSON.stringify(memories, null, 2);
  }

  return memories.join('\n\n---\n\n');
}

/**
 * Delete memory command
 */
export async function cmdDeleteMemory(args: { date: string }): Promise<string> {
  const store = getMemoryStoreManager();
  if (!store || !store.isInitialized()) {
    return 'Error: Memory not initialized for this persona';
  }

  const memoryStore = store.getStore();
  if (!memoryStore) {
    return 'Error: Memory store not available';
  }

  const success = await deleteMemory(memoryStore, args.date);

  if (success) {
    return `Memory for ${args.date} deleted.`;
  }

  return `Failed to delete memory for ${args.date}`;
}

/**
 * Export memories command
 */
export async function cmdExportMemories(args: {
  format?: 'json' | 'markdown';
}): Promise<string> {
  const store = getMemoryStoreManager();
  if (!store || !store.isInitialized()) {
    return 'Error: Memory not initialized for this persona';
  }

  const memoryStore = store.getStore();
  if (!memoryStore) {
    return 'Error: Memory store not available';
  }

  const exportData = await exportMemories(memoryStore, args.format || 'markdown');
  return exportData;
}

/**
 * Flush memory command
 */
export async function cmdFlushMemory(args: {
  content?: string;
  sessionID?: string;
  directory?: string;
}): Promise<string> {
  const store = getMemoryStoreManager();
  if (!store || !store.isInitialized()) {
    return 'Error: Memory not initialized for this persona';
  }

  const memoryStore = store.getStore();
  if (!memoryStore) {
    return 'Error: Memory store not available';
  }

  // If sessionID is provided and no custom content, use sub-agent summarization
  if (args.sessionID && !args.content) {
    try {
      // Get conversation messages to check if there's content to summarize
      const messages = await getSessionMessages(args.sessionID);

      if (messages.length === 0) {
        return 'Error: No conversation messages found to summarize';
      }

      // Summarize the conversation using sub-agent (with directory for instance context)
      const summary = await summarizeConversation(args.sessionID, args.directory);

      if (!summary || summary.trim().length === 0) {
        return 'Error: Failed to generate summary';
      }

      // Save the summary to a unique file
      const saveResult = await saveMemoryToFile(memoryStore, summary, args.sessionID);

      if (!saveResult.success) {
        return 'Error: Failed to save memory to file';
      }

      return `Memory saved successfully to ${saveResult.filename}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `Error: Failed to save memory: ${errorMessage}`;
    }
  }

  // Fall back to original behavior for custom content
  const result = await executeFlushCommand(memoryStore, {
    content: args.content,
  });

  return result.message;
}

/**
 * List memory dates command
 */
export async function cmdListMemoryDates(): Promise<string> {
  const store = getMemoryStoreManager();
  if (!store || !store.isInitialized()) {
    return 'Error: Memory not initialized for this persona';
  }

  const memoryStore = store.getStore();
  if (!memoryStore) {
    return 'Error: Memory store not available';
  }

  const dates = await getMemoryDates(memoryStore);

  if (dates.length === 0) {
    return 'No memory dates found.';
  }

  return `Memory dates:\n${dates.map(d => `- ${d}`).join('\n')}`;
}

/**
 * List saved session memories command
 */
export async function cmdListSessionMemories(): Promise<string> {
  const store = getMemoryStoreManager();
  if (!store || !store.isInitialized()) {
    return 'Error: Memory not initialized for this persona';
  }

  const memoryStore = store.getStore();
  if (!memoryStore) {
    return 'Error: Memory store not available';
  }

  const memories = await loadMemoryFiles(memoryStore);

  if (memories.length === 0) {
    return 'No saved session memories found.';
  }

  return `Saved session memories:\n${memories.map(m => `- ${m.filename} (${new Date(m.createdAt).toLocaleString()})`).join('\n')}`;
}

/**
 * View specific session memory command
 */
export async function cmdViewSessionMemory(args: { sessionId: string }): Promise<string> {
  const store = getMemoryStoreManager();
  if (!store || !store.isInitialized()) {
    return 'Error: Memory not initialized for this persona';
  }

  const memoryStore = store.getStore();
  if (!memoryStore) {
    return 'Error: Memory store not available';
  }

  const content = await getMemoryBySession(memoryStore, args.sessionId);

  if (!content) {
    return `No memory found for session ${args.sessionId}`;
  }

  return content;
}
