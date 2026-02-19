/**
 * Memory Flush Command
 *
 * Active memory flush command for users to manually save memory.
 */

import type { MemoryStore, FlushOptions } from './types.js';
import { flushMemory, addMemory } from './memory-writer.js';

/**
 * Execute flush memory command
 */
export async function executeFlushCommand(
  store: MemoryStore,
  options: FlushOptions = {}
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (options.content) {
      // User provided custom content to save
      await addMemory(store, options.content, {
        type: 'context',
        importance: options.importance || 3,
        source: 'user',
        tags: options.tags || ['manual-flush'],
      });

      return {
        success: true,
        message: 'Memory saved successfully.',
      };
    }

    // Auto flush - save current context
    await flushMemory(store, { auto: true });

    return {
      success: true,
      message: 'Context saved to memory.',
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to save memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Register flush command with TUI
 */
export function registerFlushCommand(): void {
  // This would integrate with the TUI command system
  // The actual registration happens in the CLI command handler
  console.log('Memory flush command ready');
}
