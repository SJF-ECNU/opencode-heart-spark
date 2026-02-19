/**
 * Memory Store Management
 *
 * MemoryStore class for managing persona memory paths and configuration.
 */

import { resolve, join } from 'path';
import {
  initMemoryStore,
  createMemoryTemplates,
  memoryDirectoryExists,
  ensureDailyMemoryDir,
  getDailyMemoryPath,
  formatDate,
} from './file-structure.js';
import type { MemoryStore } from './types.js';

/** Default persona base directory */
const DEFAULT_PERSONA_BASE = './persona';

/**
 * MemoryStore class for managing memory paths and operations
 */
export class MemoryStoreManager {
  private store: MemoryStore | null = null;

  /**
   * Initialize memory store for a persona
   */
  async initialize(personaId: string, personaBase: string = DEFAULT_PERSONA_BASE): Promise<MemoryStore> {
    const basePath = resolve(personaBase, personaId);
    const memoryPath = join(basePath, 'memory');

    // Ensure memory directory exists
    const { mkdir } = await import('fs/promises');
    await mkdir(memoryPath, { recursive: true });

    // Check if templates exist, create if not
    const exists = await memoryDirectoryExists(personaId);
    if (!exists) {
      await createMemoryTemplates(personaId);
    }

    // Ensure daily memory directory
    const dailyPath = join(memoryPath, 'daily');
    await mkdir(dailyPath, { recursive: true });

    this.store = {
      personaId,
      basePath,
      longTermMemoryPath: join(memoryPath, 'MEMORY.md'),
      soulPath: join(memoryPath, 'SOUL.md'),
      userPath: join(memoryPath, 'USER.md'),
      dailyMemoryPath: dailyPath,
      qmdEnabled: false,
      qmdIndexPath: join(memoryPath, 'qmd'),
    };

    return this.store;
  }

  /**
   * Get the current memory store
   */
  getStore(): MemoryStore | null {
    return this.store;
  }

  /**
   * Get path for long-term memory file
   */
  getLongTermMemoryPath(): string {
    if (!this.store) throw new Error('Memory store not initialized');
    return this.store.longTermMemoryPath;
  }

  /**
   * Get path for soul/personality memory file
   */
  getSoulPath(): string {
    if (!this.store) throw new Error('Memory store not initialized');
    return this.store.soulPath;
  }

  /**
   * Get path for user memory file
   */
  getUserPath(): string {
    if (!this.store) throw new Error('Memory store not initialized');
    return this.store.userPath;
  }

  /**
   * Get path for daily memory file
   */
  getDailyMemoryPath(date?: string): string {
    if (!this.store) throw new Error('Memory store not initialized');
    return getDailyMemoryPath(this.store, date);
  }

  /**
   * Get today's memory path
   */
  getTodayMemoryPath(): string {
    return this.getDailyMemoryPath(formatDate(new Date()));
  }

  /**
   * Check if memory store is initialized
   */
  isInitialized(): boolean {
    return this.store !== null;
  }

  /**
   * Enable QMD indexing
   */
  enableQmd(enabled: boolean = true): void {
    if (this.store) {
      this.store.qmdEnabled = enabled;
    }
  }
}

/**
 * Create a new MemoryStoreManager instance
 */
export function createMemoryStore(): MemoryStoreManager {
  return new MemoryStoreManager();
}
