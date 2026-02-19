/**
 * QMD Client
 *
 * QMD search integration for memory queries.
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { MemoryStore, MemorySearchResult, QmdSearchOptions } from './types.js';

const execAsync = promisify(exec);

/** QMD CLI path */
const QMD_BIN = 'qmd';

/**
 * Check if QMD is available
 */
export async function isQmdAvailable(): Promise<boolean> {
  try {
    await execAsync(`${QMD_BIN} --version`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Search memories using QMD
 */
export async function searchMemoriesWithQmd(
  store: MemoryStore,
  options: QmdSearchOptions
): Promise<MemorySearchResult[]> {
  const { query, limit = 10, threshold = 0.1 } = options;

  if (!store.qmdEnabled) {
    return searchMemoriesFallback(store, options);
  }

  try {
    const { stdout } = await execAsync(
      `${QMD_BIN} search "${query}" --limit ${limit} --path ${store.qmdIndexPath}`,
      { encoding: 'utf-8' }
    );

    return parseQmdResults(stdout);
  } catch (error) {
    console.warn('QMD search failed, falling back to basic search:', error);
    return searchMemoriesFallback(store, options);
  }
}

/**
 * Search memories with BM25 support (when QMD unavailable)
 */
export async function searchMemoriesWithBm25(
  store: MemoryStore,
  options: QmdSearchOptions
): Promise<MemorySearchResult[]> {
  // Use fallback for now
  return searchMemoriesFallback(store, options);
}

/**
 * Search memories with vector support
 */
export async function searchMemoriesWithVector(
  store: MemoryStore,
  options: QmdSearchOptions
): Promise<MemorySearchResult[]> {
  // Use fallback for now
  return searchMemoriesFallback(store, options);
}

/**
 * Fallback search using basic text matching
 */
export async function searchMemoriesFallback(
  store: MemoryStore,
  options: QmdSearchOptions
): Promise<MemorySearchResult[]> {
  const { query, limit = 10 } = options;
  const results: MemorySearchResult[] = [];
  const queryLower = query.toLowerCase();

  // Search in daily memories
  try {
    const files = await readdir(store.dailyMemoryPath);

    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const filePath = join(store.dailyMemoryPath, file);
      const content = await readFile(filePath, 'utf-8');

      // Simple text matching
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.toLowerCase().includes(queryLower)) {
          results.push({
            content: line.trim(),
            relevance: calculateRelevance(line, queryLower),
            source: file,
            timestamp: new Date(file.replace('.md', '')),
          });
        }
      }
    }
  } catch {
    // Directory doesn't exist yet
  }

  // Also search in long-term memory
  try {
    const longTermContent = await readFile(store.longTermMemoryPath, 'utf-8');
    const lines = longTermContent.split('\n');

    for (const line of lines) {
      if (line.toLowerCase().includes(queryLower)) {
        results.push({
          content: line.trim(),
          relevance: calculateRelevance(line, queryLower),
          source: 'MEMORY.md',
          timestamp: new Date(),
        });
      }
    }
  } catch {
    // File doesn't exist
  }

  // Sort by relevance and limit
  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

/**
 * Parse QMD search results
 */
function parseQmdResults(output: string): MemorySearchResult[] {
  const results: MemorySearchResult[] = [];
  const lines = output.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const match = line.match(/^(.+?)\s*\|\s*([\d.]+)$/);
    if (match) {
      results.push({
        content: match[1].trim(),
        relevance: parseFloat(match[2]),
        source: 'qmd',
        timestamp: new Date(),
      });
    }
  }

  return results;
}

/**
 * Calculate simple relevance score
 */
function calculateRelevance(text: string, query: string): number {
  const textLower = text.toLowerCase();
  let score = 0;

  // Exact match
  if (textLower.includes(query)) {
    score += 1;
  }

  // Word match
  const words = query.split(/\s+/);
  for (const word of words) {
    if (textLower.includes(word)) {
      score += 0.5;
    }
  }

  return score;
}

/**
 * Main searchMemories function with QMD support
 */
export async function searchMemories(
  store: MemoryStore,
  options: QmdSearchOptions
): Promise<MemorySearchResult[]> {
  const qmdAvailable = await isQmdAvailable();

  if (qmdAvailable && store.qmdEnabled) {
    return searchMemoriesWithQmd(store, options);
  }

  return searchMemoriesFallback(store, options);
}
