/**
 * Memory File Structure Management
 *
 * Handles creation and management of persona memory directory structures.
 */

import { mkdir, writeFile, readFile, access } from 'fs/promises';
import { resolve, join } from 'path';
import type { MemoryStore } from './types.js';

/** Persona base directory - can be overridden for testing */
let PERSONA_BASE = './persona';

/**
 * Set the persona base directory (useful for testing)
 */
export function setPersonaBasePath(path: string): void {
  PERSONA_BASE = path;
}

/**
 * Get the current persona base directory
 */
export function getPersonaBasePath(): string {
  return PERSONA_BASE;
}

/**
 * Initialize memory store for a persona
 */
export async function initMemoryStore(personaId: string, basePath?: string): Promise<MemoryStore> {
  const resolvedBase = basePath || PERSONA_BASE;
  const basePathResolved = resolve(resolvedBase, personaId);
  const memoryPath = join(basePathResolved, 'memory');

  // Ensure memory directory exists
  await mkdir(memoryPath, { recursive: true });

  return {
    personaId,
    basePath: basePathResolved,
    longTermMemoryPath: join(memoryPath, 'MEMORY.md'),
    soulPath: join(memoryPath, 'SOUL.md'),
    userPath: join(memoryPath, 'USER.md'),
    dailyMemoryPath: join(memoryPath, 'daily'),
    qmdEnabled: false,
    qmdIndexPath: join(memoryPath, 'qmd'),
  };
}

/**
 * Create template memory files for a new persona
 */
export async function createMemoryTemplates(personaId: string, basePath?: string): Promise<void> {
  const resolvedBase = basePath || PERSONA_BASE;
  const basePathResolved = resolve(resolvedBase, personaId);
  const memoryPath = join(basePathResolved, 'memory');

  // Create memory directory
  await mkdir(memoryPath, { recursive: true });

  // Create MEMORY.md template
  const memoryTemplate = `# 长期记忆

## 关于用户
- **名字**：[名字]
- **偏好**：[偏好描述]
- **背景**：[背景信息]

## 重要事件

## 用户偏好
`;

  // Create SOUL.md template
  const soulTemplate = `# 角色灵魂

## 核心特质
- [角色核心特质描述]

## 行为模式
- [角色行为模式]

## 记忆锚点
- [重要的记忆锚点]
`;

  // Create USER.md template
  const userTemplate = `# 用户信息

## 基本信息
- **名字**：
- **偏好**：
- **背景**：

## 交互历史

## 重要日期
`;

  // Write template files
  await writeFile(join(memoryPath, 'MEMORY.md'), memoryTemplate, 'utf-8');
  await writeFile(join(memoryPath, 'SOUL.md'), soulTemplate, 'utf-8');
  await writeFile(join(memoryPath, 'USER.md'), userTemplate, 'utf-8');
}

/**
 * Get daily memory file path
 */
export function getDailyMemoryPath(store: MemoryStore, date?: string): string {
  const targetDate = date || formatDate(new Date());
  return join(store.dailyMemoryPath, `${targetDate}.md`);
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if memory directory exists for a persona
 */
export async function memoryDirectoryExists(personaId: string, basePath?: string): Promise<boolean> {
  const resolvedBase = basePath || PERSONA_BASE;
  const memoryPath = resolve(resolvedBase, personaId, 'memory');
  try {
    await access(memoryPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure daily memory directory exists
 */
export async function ensureDailyMemoryDir(store: MemoryStore): Promise<void> {
  await mkdir(store.dailyMemoryPath, { recursive: true });
}
