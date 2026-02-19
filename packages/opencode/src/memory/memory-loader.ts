/**
 * Memory Loader
 *
 * Load memories from persona memory files on session start.
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import type { MemoryStore, MemoryEntry, DailyMemory, ViewMemoriesOptions, MemoryType } from './types.js';
import { formatDate } from './file-structure.js';

/**
 * Load memories from MEMORY.md file
 */
export async function loadMemories(store: MemoryStore): Promise<string> {
  try {
    const content = await readFile(store.longTermMemoryPath, 'utf-8');
    return content;
  } catch (error) {
    // File doesn't exist yet, return empty
    return '';
  }
}

/**
 * Load user information from USER.md
 */
export async function loadUserMemory(store: MemoryStore): Promise<string> {
  try {
    const content = await readFile(store.userPath, 'utf-8');
    return content;
  } catch (error) {
    return '';
  }
}

/**
 * Load personality/soul information from SOUL.md
 */
export async function loadPersonalityMemory(store: MemoryStore): Promise<string> {
  try {
    const content = await readFile(store.soulPath, 'utf-8');
    return content;
  } catch (error) {
    return '';
  }
}

/**
 * Load daily memories for a specific date
 */
export async function loadDailyMemory(store: MemoryStore, date?: string): Promise<DailyMemory> {
  const targetDate = date || formatDate(new Date());
  const filePath = join(store.dailyMemoryPath, `${targetDate}.md`);

  try {
    const content = await readFile(filePath, 'utf-8');
    const entries = parseMemoryEntries(content);
    return {
      date: targetDate,
      entries,
      retain: entries.filter(e => e.prefix === 'W' || e.prefix === 'B'),
    };
  } catch (error) {
    return {
      date: targetDate,
      entries: [],
      retain: [],
    };
  }
}

/**
 * Parse memory entries from markdown content
 */
function parseMemoryEntries(content: string): MemoryEntry[] {
  const entries: MemoryEntry[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^-\s*([WB])\s*@[\w]+\s*:\s*(.+)$/);
    if (match) {
      entries.push({
        prefix: match[1] as 'W' | 'B',
        content: match[2].trim(),
      });
    }
  }

  return entries;
}

/**
 * Load memories for session context
 */
export async function loadMemoryContext(store: MemoryStore): Promise<{
  longTerm: string;
  user: string;
  personality: string;
  recentDaily: string[];
}> {
  const [longTerm, user, personality] = await Promise.all([
    loadMemories(store),
    loadUserMemory(store),
    loadPersonalityMemory(store),
  ]);

  // Load recent daily memories (last 7 days)
  const recentDaily: string[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);

    try {
      const dailyPath = join(store.dailyMemoryPath, `${dateStr}.md`);
      const content = await readFile(dailyPath, 'utf-8');
      if (content.trim()) {
        recentDaily.push(content);
      }
    } catch {
      // File doesn't exist, skip
    }
  }

  return {
    longTerm,
    user,
    personality,
    recentDaily,
  };
}

/**
 * View memories with filtering options
 */
export async function viewMemories(
  store: MemoryStore,
  options: ViewMemoriesOptions = {}
): Promise<string[]> {
  const memories: string[] = [];
  const { type, days = 7, limit = 50 } = options;

  // Load long-term memories
  if (!type || type === 'preference' || type === 'event') {
    const longTerm = await loadMemories(store);
    if (longTerm) {
      memories.push(`## 长期记忆\n${longTerm}`);
    }
  }

  // Load daily memories for specified days
  const today = new Date();
  let count = 0;

  for (let i = 0; i < days && count < limit; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);

    try {
      const dailyPath = join(store.dailyMemoryPath, `${dateStr}.md`);
      const content = await readFile(dailyPath, 'utf-8');
      if (content.trim()) {
        memories.push(`## ${dateStr}\n${content}`);
        count++;
      }
    } catch {
      // File doesn't exist, skip
    }
  }

  return memories;
}

/**
 * Get all available memory dates
 */
export async function getMemoryDates(store: MemoryStore): Promise<string[]> {
  try {
    const files = await readdir(store.dailyMemoryPath);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

/**
 * Get the session memory directory path
 */
function getSessionMemoryPath(store: MemoryStore): string {
  return join(store.basePath, 'sessions');
}

/**
 * Load all session memory files
 */
export async function loadMemoryFiles(store: MemoryStore): Promise<{
  filename: string;
  content: string;
  createdAt: number;
}[]> {
  try {
    const sessionPath = getSessionMemoryPath(store);
    const files = await readdir(sessionPath);

    const memoryFiles = await Promise.all(
      files
        .filter(f => f.endsWith('.md'))
        .map(async (filename) => {
          const filePath = join(sessionPath, filename);
          const stats = await stat(filePath);
          const content = await readFile(filePath, 'utf-8');
          return {
            filename,
            content,
            createdAt: stats.birthtimeMs,
          };
        })
    );

    // Sort by creation date, newest first
    return memoryFiles.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    // Directory doesn't exist or other error
    return [];
  }
}

/**
 * Get memory by session ID
 */
export async function getMemoryBySession(
  store: MemoryStore,
  sessionId: string
): Promise<string | null> {
  try {
    const sessionPath = getSessionMemoryPath(store);
    const filePath = join(sessionPath, `${sessionId}.md`);

    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch {
    // File doesn't exist
    return null;
  }
}
