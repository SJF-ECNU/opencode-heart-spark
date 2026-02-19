/**
 * Memory System Tests
 *
 * Tests for memory file structure initialization and basic operations.
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdir, rm, access, readFile } from 'fs/promises';
import { resolve, join } from 'path';
import { initMemoryStore, createMemoryTemplates, getDailyMemoryPath, formatDate, memoryDirectoryExists, setPersonaBasePath, getPersonaBasePath } from './file-structure.js';

const TEST_PERSONA_ID = 'test-persona';
const TEST_BASE_PATH = resolve('./test-persona-storage');  // Use absolute path in package dir

describe('Memory File Structure', () => {
  beforeEach(async () => {
    // Clean up test persona directory
    try {
      await rm(TEST_BASE_PATH, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    // Set test base path
    setPersonaBasePath(TEST_BASE_PATH);
  });

  afterEach(async () => {
    // Clean up test persona directory
    try {
      await rm(TEST_BASE_PATH, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    // Reset base path
    setPersonaBasePath('./persona');
  });

  test('should create memory directory structure', async () => {
    const store = await initMemoryStore(TEST_PERSONA_ID);

    expect(store.personaId).toBe(TEST_PERSONA_ID);
    expect(store.basePath).toContain(TEST_PERSONA_ID);
    expect(store.longTermMemoryPath).toContain('MEMORY.md');
    expect(store.soulPath).toContain('SOUL.md');
    expect(store.userPath).toContain('USER.md');

    // Verify directories exist
    await expect(access(store.dailyMemoryPath)).resolves.not.toThrow();
  });

  test('should create template files', async () => {
    await createMemoryTemplates(TEST_PERSONA_ID);

    const memoryPath = join(TEST_BASE_PATH, TEST_PERSONA_ID, 'memory');

    // Check template files exist
    await expect(access(join(memoryPath, 'MEMORY.md'))).resolves.not.toThrow();
    await expect(access(join(memoryPath, 'SOUL.md'))).resolves.not.toThrow();
    await expect(access(join(memoryPath, 'USER.md'))).resolves.not.toThrow();

    // Check content
    const memoryContent = await readFile(join(memoryPath, 'MEMORY.md'), 'utf-8');
    expect(memoryContent).toContain('# 长期记忆');

    const soulContent = await readFile(join(memoryPath, 'SOUL.md'), 'utf-8');
    expect(soulContent).toContain('# 角色灵魂');

    const userContent = await readFile(join(memoryPath, 'USER.md'), 'utf-8');
    expect(userContent).toContain('# 用户信息');
  });

  test('should format date correctly', () => {
    const date = new Date('2026-02-19');
    expect(formatDate(date)).toBe('2026-02-19');
  });

  test('should get daily memory path', async () => {
    const store = await initMemoryStore(TEST_PERSONA_ID);
    const path = getDailyMemoryPath(store, '2026-02-19');

    expect(path).toContain('2026-02-19.md');
  });

  test('should check memory directory exists', async () => {
    expect(await memoryDirectoryExists(TEST_PERSONA_ID)).toBe(false);

    await createMemoryTemplates(TEST_PERSONA_ID);

    expect(await memoryDirectoryExists(TEST_PERSONA_ID)).toBe(true);
  });
});

describe('MemoryStoreManager', () => {
  beforeEach(async () => {
    try {
      await rm(TEST_BASE_PATH, { recursive: true, force: true });
    } catch {
      // Ignore
    }
    setPersonaBasePath(TEST_BASE_PATH);
  });

  afterEach(async () => {
    try {
      await rm(TEST_BASE_PATH, { recursive: true, force: true });
    } catch {
      // Ignore
    }
    setPersonaBasePath('./persona');
  });

  test('should initialize and get paths', async () => {
    const { MemoryStoreManager } = await import('./memory-store.js');
    const manager = new MemoryStoreManager();

    await manager.initialize(TEST_PERSONA_ID);

    expect(manager.isInitialized()).toBe(true);
    expect(manager.getLongTermMemoryPath()).toContain('MEMORY.md');
    expect(manager.getSoulPath()).toContain('SOUL.md');
    expect(manager.getUserPath()).toContain('USER.md');
  });
});
