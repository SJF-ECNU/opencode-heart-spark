# Memory System API Contracts

## 1. Memory Store API

### Initialize Memory Store

```typescript
// 创建角色的记忆存储目录
interface InitMemoryStoreRequest {
  personaId: string;
  personaName: string;
}

interface InitMemoryStoreResponse {
  success: boolean;
  storePath: string;
}
```

### Load Memories

```typescript
// 会话开始时加载记忆
interface LoadMemoriesRequest {
  personaId: string;
  includeDaily?: boolean;  // 是否包含每日记忆
  days?: number;          // 包含最近几天
}

interface LoadMemoriesResponse {
  longTermMemory: Memory[];
  dailyMemories: Memory[];
  loadedAt: Date;
}
```

## 2. Memory Operations API

### Add Memory

```typescript
interface AddMemoryRequest {
  personaId: string;
  content: string;
  type: MemoryType;
  tags?: string[];
  importance?: 1 | 2 | 3 | 4 | 5;
  isPermanent?: boolean;  // 是否永久保存
}

interface AddMemoryResponse {
  success: boolean;
  memoryId: string;
  savedTo: string;  // 文件路径
}
```

### Search Memories

```typescript
interface SearchMemoriesRequest {
  personaId: string;
  query: string;
  searchType: 'bm25' | 'vector' | 'hybrid';
  maxResults?: number;
}

interface SearchMemoriesResponse {
  results: MemorySearchResult[];
  searchType: string;
  queryTime: number;
}

interface MemorySearchResult {
  memory: Memory;
  score: number;
  sourceFile: string;
  lineNumber: number;
}
```

### View All Memories

```typescript
interface ViewMemoriesRequest {
  personaId: string;
  filter?: {
    type?: MemoryType;
    fromDate?: string;
    toDate?: string;
  };
}

interface ViewMemoriesResponse {
  memories: Memory[];
  total: number;
}
```

### Delete Memory

```typescript
interface DeleteMemoryRequest {
  personaId: string;
  memoryId: string;
}

interface DeleteMemoryResponse {
  success: boolean;
  deletedId: string;
}
```

## 3. Flush Command API

### Manual Flush

```typescript
interface FlushMemoryRequest {
  personaId: string;
  content?: string;  // 可选，指定要保存的内容
  targetFile?: 'daily' | 'longterm';
}

interface FlushMemoryResponse {
  success: boolean;
  savedTo: string;
  entriesSaved: number;
  message: string;
}
```

## 4. Export API

### Export Memories

```typescript
interface ExportMemoriesRequest {
  personaId: string;
  format: 'json' | 'markdown' | 'zip';
  includeDaily?: boolean;
}

interface ExportMemoriesResponse {
  success: boolean;
  exportPath: string;
  format: string;
}
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `/memory flush` | 刷新当前会话的重要记忆 |
| `/memory flush --content "..."` | 指定内容刷新 |
| `/memory view` | 查看所有记忆 |
| `/memory search <query>` | 搜索记忆 |
| `/memory delete <id>` | 删除指定记忆 |
| `/memory export` | 导出记忆 |
