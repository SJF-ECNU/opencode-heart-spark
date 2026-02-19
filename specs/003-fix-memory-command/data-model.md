# Data Model: Fix Memory Command

## Entities

### Conversation
Represents the current session's conversation history.

| Field | Type | Description |
|-------|------|-------------|
| sessionID | string | Unique identifier for the session |
| messages | Message[] | Array of conversation messages |

### Message
Individual message in a conversation.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique message identifier |
| role | "user" \| "assistant" | Who sent the message |
| content | string | The message content |
| timestamp | number | When the message was sent |

### MemorySummary
AI-generated summary of conversation content.

| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID for this summary |
| sessionID | string | Original session ID |
| content | string | The AI-generated summary |
| timestamp | number | When the summary was created |
| source | "subagent" | How the summary was generated |

### MemoryFile
Persistent storage for memory summaries.

| Field | Type | Description |
|-------|------|-------------|
| filename | string | Unique filename (timestamp or UUID) |
| path | string | Full path to the file |
| content | string | The memory content |
| createdAt | number | File creation timestamp |

## Validation Rules

- Memory summary must be non-empty
- Memory filename must be unique (use timestamp + UUID)
- Memory content must not exceed reasonable size limits
- Session must have at least one message to summarize

## State Transitions

```
User triggers /memory
       │
       ▼
Check conversation exists
       │
       ▼
Invoke sub-agent for summarization
       │
       ▼
Generate unique filename (timestamp_UUID.md)
       │
       ▼
Save to memory file
       │
       ▼
Return success/failure to user
```

## API Contracts

### Memory Command Flow

1. **User Input**: `/memory` command in TUI
2. **Handler**: `cmdFlushMemory` in `memory-commands.ts`
3. **Process**:
   - Get session messages
   - Invoke sub-agent with summarization prompt
   - Save summary to new file
4. **Response**: Success/error message to user

### Key Functions

```typescript
// In memory-commands.ts
async function summarizeConversation(sessionID: string): Promise<string>

// In memory-writer.ts
async function saveMemoryToFile(
  content: string,
  persona: string
): Promise<{ success: boolean; path: string }>
```
