/**
 * Memory Export
 *
 * Export memory data for user management.
 */

import { readFile, readdir, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { MemoryStore } from './types.js';

/**
 * Export all memories for a persona
 */
export async function exportMemories(
  store: MemoryStore,
  format: 'json' | 'markdown' = 'markdown'
): Promise<string> {
  const exportData: {
    personaId: string;
    exportedAt: string;
    memories: {
      longTerm?: string;
      user?: string;
      personality?: string;
      daily: Array<{ date: string; content: string }>;
    };
  } = {
    personaId: store.personaId,
    exportedAt: new Date().toISOString(),
    memories: {
      daily: [],
    },
  };

  // Export long-term memory
  try {
    exportData.memories.longTerm = await readFile(store.longTermMemoryPath, 'utf-8');
  } catch {
    // File doesn't exist
  }

  // Export user memory
  try {
    exportData.memories.user = await readFile(store.userPath, 'utf-8');
  } catch {
    // File doesn't exist
  }

  // Export personality memory
  try {
    exportData.memories.personality = await readFile(store.soulPath, 'utf-8');
  } catch {
    // File doesn't exist
  }

  // Export daily memories
  try {
    const files = await readdir(store.dailyMemoryPath);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const date = file.replace('.md', '');
      const content = await readFile(join(store.dailyMemoryPath, file), 'utf-8');
      exportData.memories.daily.push({ date, content });
    }
  } catch {
    // Directory doesn't exist
  }

  // Sort daily memories by date
  exportData.memories.daily.sort((a, b) => b.date.localeCompare(a.date));

  if (format === 'json') {
    return JSON.stringify(exportData, null, 2);
  }

  // Markdown format
  let markdown = `# Memory Export: ${store.personaId}\n\n`;
  markdown += `Exported: ${exportData.exportedAt}\n\n---\n\n`;

  if (exportData.memories.user) {
    markdown += `## User Information\n\n${exportData.memories.user}\n\n---\n\n`;
  }

  if (exportData.memories.personality) {
    markdown += `## Personality\n\n${exportData.memories.personality}\n\n---\n\n`;
  }

  if (exportData.memories.longTerm) {
    markdown += `## Long-term Memory\n\n${exportData.memories.longTerm}\n\n---\n\n`;
  }

  if (exportData.memories.daily.length > 0) {
    markdown += `## Daily Memories\n\n`;
    for (const daily of exportData.memories.daily) {
      markdown += `### ${daily.date}\n\n${daily.content}\n\n---\n\n`;
    }
  }

  return markdown;
}

/**
 * Export memories to a file
 */
export async function exportMemoriesToFile(
  store: MemoryStore,
  outputPath: string,
  format: 'json' | 'markdown' = 'markdown'
): Promise<void> {
  const content = await exportMemories(store, format);

  // Ensure directory exists
  const dir = join(outputPath, '..');
  await mkdir(dir, { recursive: true });

  await writeFile(outputPath, content, 'utf-8');
}
