/**
 * Persona Memory Integration
 *
 * Integrate memory system with persona loader for session start.
 */

import { MemoryStoreManager, createMemoryStore } from '../memory/memory-store.js';
import { loadMemoryContext } from '../memory/memory-loader.js';
import { createMemoryTemplates } from '../memory/file-structure.js';
import { initMemoryAutoFlush } from '../memory/auto-flush.js';

/** Global memory store manager instance */
let memoryStoreManager: MemoryStoreManager | null = null;

/** Current persona ID */
let currentPersonaId: string | null = null;

/**
 * Initialize memory system for a persona
 */
export async function initializePersonaMemory(personaId: string): Promise<MemoryStoreManager> {
  currentPersonaId = personaId;
  memoryStoreManager = createMemoryStore();
  await memoryStoreManager.initialize(personaId);
  // Initialize auto-flush hook for session compaction
  initMemoryAutoFlush();
  return memoryStoreManager;
}

/**
 * Get the current memory store manager
 */
export function getMemoryStoreManager(): MemoryStoreManager | null {
  return memoryStoreManager;
}

/**
 * Get current persona ID
 */
export function getCurrentPersonaId(): string | null {
  return currentPersonaId;
}

/**
 * Get memory context for persona session
 */
export async function getPersonaMemoryContext(): Promise<string> {
  if (!memoryStoreManager || !memoryStoreManager.isInitialized()) {
    return '';
  }

  const store = memoryStoreManager.getStore();
  if (!store) {
    return '';
  }

  const context = await loadMemoryContext(store);

  // Build memory context string
  let memoryContext = '\n\n---\n\n## 角色记忆\n\n';

  if (context.user) {
    memoryContext += '### 用户信息\n' + context.user + '\n\n';
  }

  if (context.personality) {
    memoryContext += '### 角色人格\n' + context.personality + '\n\n';
  }

  if (context.longTerm) {
    memoryContext += '### 长期记忆\n' + context.longTerm + '\n\n';
  }

  if (context.recentDaily.length > 0) {
    memoryContext += '### 最近对话\n';
    for (const daily of context.recentDaily) {
      memoryContext += daily + '\n\n';
    }
  }

  return memoryContext;
}

/**
 * Create memory directory for a new persona
 */
export async function ensurePersonaMemoryExists(personaId: string): Promise<void> {
  await createMemoryTemplates(personaId);
}

/**
 * Check if memory is initialized for current persona
 */
export function isMemoryInitialized(): boolean {
  return memoryStoreManager !== null && memoryStoreManager.isInitialized();
}

/**
 * Reset memory store (for switching personas or logout)
 */
export function resetMemoryStore(): void {
  memoryStoreManager = null;
  currentPersonaId = null;
}
