# Data Model: Personalized Memory System

**Feature**: 001-personalized-memory
**Date**: 2026-02-19

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│    Persona      │       │  MemoryStore    │
├─────────────────┤       ├─────────────────┤
│ id: string      │◄──────│ personaId: string│
│ name: string    │       │ basePath: string │
│ memoryPath: str │       └────────┬────────┘
└─────────────────┘                │
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
           ▼                      ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  LongTermMemory │  │  DailyMemory    │  │    QMDIndex    │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ file: MEMORY.md│  │ file: YYYY-MM-DD│  │ path: qmd/     │
│ type: permanent │  │ type: daily     │  │ status: active │
│ entries: Memory │  │ entries: Memory │  │ lastUpdate:Date│
└─────────────────┘  └─────────────────┘  └─────────────────┘
           │
           ▼
┌─────────────────┐
│     Memory      │
├─────────────────┤
│ id: string      │
│ content: string │
│ timestamp: Date │
│ type: preference│
│       | event   │
│       | context │
│ tags: string[]  │
│ importance: 1-5 │
└─────────────────┘
```

## Entities

### 1. Memory (记忆条目)

```typescript
interface Memory {
  id: string;              // UUID
  content: string;         // 记忆内容
  timestamp: Date;          // 创建时间
  type: MemoryType;         // 记忆类型
  tags: string[];          // 标签
  importance: 1 | 2 | 3 | 4 | 5;  // 重要性
  source: 'user' | 'character' | 'system';  // 来源
}

type MemoryType =
  | 'preference'    // 用户偏好
  | 'event'        // 重要事件
  | 'context'       // 上下文
  | 'decision'     // 决策
  | 'personality';  // 角色人格
```

### 2. MemoryStore (记忆存储)

```typescript
interface MemoryStore {
  personaId: string;
  basePath: string;

  // 文件路径
  longTermMemoryPath: string;  // MEMORY.md
  soulPath: string;           // SOUL.md
  userPath: string;           // USER.md
  dailyMemoryPath: string;     // memory/YYYY-MM-DD.md

  // QMD 配置
  qmdEnabled: boolean;
  qmdIndexPath: string;
}
```

### 3. MemoryEntry (记忆文件条目)

```typescript
interface MemoryEntry {
  // 来源: 用户告诉角色
  prefix: 'W';  // "W @用户:"
  content: string;

  // 来源: 角色行为/反应
  prefix: 'B';  // "B @角色名:"
  content: string;
}
```

## Validation Rules

| Field | Rule |
|-------|------|
| Memory.content | 非空，最小 1 字符，最大 10000 字符 |
| Memory.type | 必须是定义的枚举值之一 |
| Memory.importance | 必须是 1-5 之间的整数 |
| DailyMemory.date | 必须是有效的 YYYY-MM-DD 格式 |
| QMDIndex.path | 必须是有效的目录路径 |

## State Transitions

```
[创建角色] ──► [初始化记忆目录]
      │
      ▼
[加载历史记忆] ◄── [新会话开始]
      │
      ▼
[对话进行中] ◄─── [用户输入]
      │
      ├──► [自动写入每日记忆] (每个有意义对话后)
      │
      ├──► [触发刷新] (上下文压缩前)
      │
      └──► [用户触发命令] (主动刷新/查看/搜索)
```

## File Formats

### MEMORY.md 格式

```markdown
# 长期记忆

## 关于用户
- **名字**：[名字]
- **偏好**：[偏好描述]
- **背景**：[背景信息]

## 重要事件
- [日期]: [事件描述]

## 用户偏好
- [偏好项1]
- [偏好项2]
```

### 每日记忆格式 (memory/YYYY-MM-DD.md)

```markdown
# YYYY-MM-DD

## 对话记录
- [时间] 用户: [内容]
- [时间] 角色: [内容]

## Retain（重要记忆）
- W @用户: [用户说的重要内容]
- B @角色: [角色的重要反应]
```
