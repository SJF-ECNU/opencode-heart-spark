/**
 * Memory System Type Definitions
 *
 * Types for the personalized memory system that enables
 * personas to remember user interactions and preferences.
 */

/** Memory entry types */
export type MemoryType =
  | 'preference'    // User preference
  | 'event'         // Important event
  | 'context'       // Context
  | 'decision'      // Decision
  | 'personality';  // Character personality

/** Memory source */
export type MemorySource = 'user' | 'character' | 'system';

/** Memory entry importance level */
export type MemoryImportance = 1 | 2 | 3 | 4 | 5;

/** Individual memory entry */
export interface Memory {
  id: string;
  content: string;
  timestamp: Date;
  type: MemoryType;
  tags: string[];
  importance: MemoryImportance;
  source: MemorySource;
}

/** Memory store configuration for a persona */
export interface MemoryStore {
  personaId: string;
  basePath: string;
  longTermMemoryPath: string;  // MEMORY.md
  soulPath: string;           // SOUL.md
  userPath: string;           // USER.md
  dailyMemoryPath: string;    // memory/YYYY-MM-DD.md
  qmdEnabled: boolean;
  qmdIndexPath: string;
}

/** Memory entry format in files (prefix-based) */
export interface MemoryEntry {
  prefix: 'W' | 'B';  // W = user told, B = character behavior
  content: string;
}

/** Daily memory structure */
export interface DailyMemory {
  date: string;  // YYYY-MM-DD
  entries: MemoryEntry[];
  retain: MemoryEntry[];  // Important memories to keep
}

/** Memory search result */
export interface MemorySearchResult {
  content: string;
  relevance: number;
  source: string;
  timestamp: Date;
}

/** Memory flush options */
export interface FlushOptions {
  content?: string;
  auto?: boolean;
  importance?: MemoryImportance;
  tags?: string[];
}

/** Memory view options */
export interface ViewMemoriesOptions {
  type?: MemoryType;
  days?: number;
  limit?: number;
}

/** QMD search options */
export interface QmdSearchOptions {
  query: string;
  limit?: number;
  threshold?: number;
}
