/**
 * Memory Auto-Flush Hook
 *
 * Hook into session compaction to automatically save memory before compaction.
 * Uses lazy initialization to avoid context issues during app startup.
 */

import { Bus } from '@/bus';
import { SessionCompaction } from '@/session/compaction';
import { getMemoryStoreManager } from '@/persona/memory-integration';
import { flushMemory } from '@/memory/memory-writer';
import { Log } from '@/util/log';

const log = Log.create({ service: 'memory.auto-flush' });

let isHandlerRegistered = false;

/**
 * Memory auto-flush handler - handles compaction events
 */
async function handleCompaction(event: { properties: { sessionID: string } }) {
  log.info('Session compaction detected, triggering memory flush', { sessionID: event.properties.sessionID });

  const store = getMemoryStoreManager();
  if (!store || !store.isInitialized()) {
    log.info('Memory store not initialized, skipping auto-flush');
    return;
  }

  const memoryStore = store.getStore();
  if (!memoryStore) {
    return;
  }

  try {
    await flushMemory(memoryStore, { auto: true });
    log.info('Memory auto-flush completed');
  } catch (error) {
    log.error('Memory auto-flush failed', { error });
  }
}

/**
 * Register the compaction event handler (lazy initialization)
 * Safe to call during app startup - doesn't immediately subscribe
 */
export function initMemoryAutoFlush(): void {
  if (isHandlerRegistered) {
    return;
  }

  // Defer the actual subscription to after the current call stack
  // This allows the app to finish initializing before we subscribe
  setTimeout(() => {
    try {
      Bus.subscribe(SessionCompaction.Event.Compacted, handleCompaction);
      isHandlerRegistered = true;
      log.info('Memory auto-flush hook initialized');
    } catch (error) {
      log.warn('Failed to register compaction handler', { error });
    }
  }, 0);
}

/**
 * Check if memory flush is needed based on context usage
 */
export async function checkAndFlushMemory(): Promise<boolean> {
  const store = getMemoryStoreManager();
  if (!store || !store.isInitialized()) {
    return false;
  }

  // This would be called from the session processor
  // to check if memory flush is needed
  return true;
}
