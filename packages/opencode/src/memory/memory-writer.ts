/**
 * Memory Writer
 *
 * Write new memories to persona memory files.
 */

import { writeFile, mkdir, readFile, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';
import type { MemoryStore, Memory, MemoryImportance, FlushOptions } from './types.js';
import { formatDate, ensureDailyMemoryDir } from './file-structure.js';

/**
 * Generate a unique memory filename with timestamp and UUID
 */
export function generateUniqueMemoryFilename(): string {
  const timestamp = Date.now();
  const uuid = randomUUID().slice(0, 8);
  return `${timestamp}_${uuid}.md`;
}

/**
 * Generate session memory path for a specific persona
 */
export function getSessionMemoryPath(store: MemoryStore): string {
  return join(store.basePath, 'sessions');
}

/**
 * Ensure session memory directory exists
 */
export async function ensureSessionMemoryDir(store: MemoryStore): Promise<string> {
  const sessionPath = getSessionMemoryPath(store);
  try {
    await mkdir(sessionPath, { recursive: true });
  } catch (error) {
    // Directory may already exist
  }
  return sessionPath;
}

/**
 * Save memory content to a unique session file
 */
export async function saveMemoryToFile(
  store: MemoryStore,
  content: string,
  sessionId?: string
): Promise<{ success: boolean; path: string; filename: string }> {
  try {
    const sessionPath = await ensureSessionMemoryDir(store);

    // Generate unique filename
    const filename = sessionId
      ? `${sessionId}.md`
      : generateUniqueMemoryFilename();
    const filePath = join(sessionPath, filename);

    // Create the file with memory content
    const memoryContent = `# Memory - ${new Date().toISOString()}

${content}
`;

    await writeFile(filePath, memoryContent, 'utf-8');

    return {
      success: true,
      path: filePath,
      filename,
    };
  } catch (error) {
    console.error('Failed to save memory to file:', error);
    return {
      success: false,
      path: '',
      filename: '',
    };
  }
}

/**
 * Generate a unique memory ID
 */
export function generateMemoryId(): string {
  return randomUUID();
}

/**
 * Add a memory entry
 */
export async function addMemory(
  store: MemoryStore,
  content: string,
  options: {
    type?: 'preference' | 'event' | 'context' | 'decision' | 'personality';
    importance?: MemoryImportance;
    source?: 'user' | 'character' | 'system';
    tags?: string[];
  } = {}
): Promise<string> {
  const memory: Memory = {
    id: generateMemoryId(),
    content,
    timestamp: new Date(),
    type: options.type || 'context',
    importance: options.importance || 3,
    source: options.source || 'user',
    tags: options.tags || [],
  };

  // Append to daily memory
  await appendToDailyMemory(store, memory);

  return memory.id;
}

/**
 * Append to daily memory file
 */
export async function appendToDailyMemory(
  store: MemoryStore,
  memory: Memory
): Promise<void> {
  await ensureDailyMemoryDir(store);

  const dateStr = formatDate(memory.timestamp);
  const filePath = join(store.dailyMemoryPath, `${dateStr}.md`);

  // Determine prefix based on source
  const prefix = memory.source === 'user' ? 'W' : 'B';
  const entry = `- ${prefix} @${memory.source === 'user' ? 'user' : 'character'}: ${memory.content}`;

  // Check if file exists
  let existingContent = '';
  try {
    existingContent = await readFile(filePath, 'utf-8');
  } catch {
    // File doesn't exist, start fresh
    existingContent = `# ${dateStr}\n\n## 对话记录\n\n## Retain（重要记忆）\n`;
  }

  // Append new entry to Retain section
  const newContent = existingContent.endsWith('\n')
    ? `${existingContent}${entry}\n`
    : `${existingContent}\n${entry}\n`;

  await writeFile(filePath, newContent, 'utf-8');
}

/**
 * Append to long-term memory
 */
export async function appendToLongTermMemory(
  store: MemoryStore,
  content: string,
  section: 'user' | 'events' | 'preferences' = 'user'
): Promise<void> {
  const filePath = store.longTermMemoryPath;

  let existingContent = '';
  try {
    existingContent = await readFile(filePath, 'utf-8');
  } catch {
    // File doesn't exist, create new
    existingContent = '# 长期记忆\n\n';
  }

  // Find or create section
  const sectionHeader = `## ${section === 'user' ? '关于用户' : section === 'events' ? '重要事件' : '用户偏好'}`;

  if (existingContent.includes(sectionHeader)) {
    // Append to existing section
    const lines = existingContent.split('\n');
    const sectionIndex = lines.findIndex(line => line.trim() === sectionHeader);

    // Find next section or end
    let insertIndex = lines.length;
    for (let i = sectionIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith('## ')) {
        insertIndex = i;
        break;
      }
    }

    lines.splice(insertIndex, 0, `- ${content}`);
    existingContent = lines.join('\n');
  } else {
    // Add new section
    existingContent += `\n${sectionHeader}\n- ${content}\n`;
  }

  await writeFile(filePath, existingContent, 'utf-8');
}

/**
 * Save personality/soul memory
 */
export async function savePersonalityMemory(
  store: MemoryStore,
  content: string,
  section: 'traits' | 'behaviors' | 'anchors' = 'traits'
): Promise<void> {
  const filePath = store.soulPath;

  let existingContent = '';
  try {
    existingContent = await readFile(filePath, 'utf-8');
  } catch {
    existingContent = '# 角色灵魂\n\n';
  }

  const sectionHeaders: Record<string, string> = {
    traits: '## 核心特质',
    behaviors: '## 行为模式',
    anchors: '## 记忆锚点',
  };

  const sectionHeader = sectionHeaders[section];

  if (existingContent.includes(sectionHeader)) {
    const lines = existingContent.split('\n');
    const sectionIndex = lines.findIndex(line => line.trim() === sectionHeader);

    let insertIndex = lines.length;
    for (let i = sectionIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith('## ')) {
        insertIndex = i;
        break;
      }
    }

    lines.splice(insertIndex, 0, `- ${content}`);
    existingContent = lines.join('\n');
  } else {
    existingContent += `\n${sectionHeader}\n- ${content}\n`;
  }

  await writeFile(filePath, existingContent, 'utf-8');
}

/**
 * Save user information
 */
export async function saveUserMemory(
  store: MemoryStore,
  content: string,
  field: 'name' | 'preferences' | 'background' | 'dates' = 'preferences'
): Promise<void> {
  const filePath = store.userPath;

  let existingContent = '';
  try {
    existingContent = await readFile(filePath, 'utf-8');
  } catch {
    existingContent = '# 用户信息\n\n## 基本信息\n\n## 交互历史\n\n## 重要日期\n';
  }

  const fieldHeaders: Record<string, string> = {
    name: '## 基本信息',
    preferences: '## 用户偏好',
    background: '## 基本信息',
    dates: '## 重要日期',
  };

  const sectionHeader = fieldHeaders[field];

  if (existingContent.includes(sectionHeader)) {
    const lines = existingContent.split('\n');
    const sectionIndex = lines.findIndex(line => line.trim() === sectionHeader);

    let insertIndex = lines.length;
    for (let i = sectionIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith('## ') || lines[i].startsWith('# ')) {
        insertIndex = i;
        break;
      }
    }

    lines.splice(insertIndex, 0, `- ${content}`);
    existingContent = lines.join('\n');
  } else {
    existingContent += `\n${sectionHeader}\n- ${content}\n`;
  }

  await writeFile(filePath, existingContent, 'utf-8');
}

/**
 * Delete a specific memory file
 */
export async function deleteMemory(
  store: MemoryStore,
  date: string
): Promise<boolean> {
  const filePath = join(store.dailyMemoryPath, `${date}.md`);

  try {
    const { unlink } = await import('fs/promises');
    await unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Flush memory with options
 */
export async function flushMemory(
  store: MemoryStore,
  options: FlushOptions = {}
): Promise<void> {
  if (options.content) {
    // User-provided content
    await addMemory(store, options.content, {
      type: 'context',
      importance: options.importance || 3,
      source: 'user',
      tags: options.tags,
    });
  } else if (options.auto) {
    // Auto-flush from session - save important context
    // This would typically be called before context compaction
    await appendToDailyMemory(store, {
      id: generateMemoryId(),
      content: '[自动保存] 对话上下文已保存',
      timestamp: new Date(),
      type: 'context',
      importance: 3,
      source: 'system',
      tags: ['auto-flush'],
    });
  }
}
