/**
 * Memory Error Handling
 *
 * Handle corrupted memory files gracefully.
 */

import { readFile } from 'fs/promises';
import { Log } from '../util/log';

const log = Log.create({ service: 'memory.error-handling' });

/**
 * Safe read memory file with error handling
 */
export async function safeReadMemoryFile(
  filePath: string,
  fallbackContent: string = ''
): Promise<{ content: string; corrupted: boolean }> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return { content, corrupted: false };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return fallback
      return { content: fallbackContent, corrupted: false };
    }

    // File exists but is corrupted
    log.error('Memory file corrupted', { filePath, error });
    return { content: fallbackContent, corrupted: true };
  }
}

/**
 * Validate memory file content
 */
export function validateMemoryContent(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for null bytes
  if (content.includes('\0')) {
    errors.push('Contains null bytes');
  }

  // Check for valid UTF-8 (basic check)
  try {
    Buffer.from(content, 'utf-8');
  } catch {
    errors.push('Invalid UTF-8 encoding');
  }

  // Check for reasonable size (max 10MB)
  if (content.length > 10 * 1024 * 1024) {
    errors.push('File too large (>10MB)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Attempt to recover corrupted memory file
 */
export async function recoverCorruptedMemory(
  filePath: string,
  backup: boolean = true
): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf-8');

    // Try to extract valid portions
    const lines = content.split('\n');
    const validLines: string[] = [];

    for (const line of lines) {
      // Skip lines with null bytes
      if (line.includes('\0')) {
        continue;
      }

      // Skip lines that are too long (potential corruption)
      if (line.length > 10000) {
        continue;
      }

      validLines.push(line);
    }

    const recovered = validLines.join('\n');

    if (backup) {
      // Create backup of corrupted file
      const backupPath = `${filePath}.corrupted.${Date.now()}`;
      const { writeFile } = await import('fs/promises');
      await writeFile(backupPath, content, 'utf-8');
      log.info('Created backup of corrupted file', { original: filePath, backup: backupPath });
    }

    return recovered;
  } catch (error) {
    log.error('Failed to recover corrupted memory file', { filePath, error });
    return '';
  }
}
