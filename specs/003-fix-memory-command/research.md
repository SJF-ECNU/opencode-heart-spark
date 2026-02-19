# Research: Fix Memory Command to Use Sub-Agent Summarization

## Overview

This document contains research findings for implementing the /memory command fix that uses a sub-agent to summarize conversation content and save to a new file.

## Key Findings

### 1. Conversation Access

**Decision**: Use `Session.messages({ sessionID })` to retrieve conversation history.

**Rationale**:
- The `Session` module from `@/session` provides access to session messages
- The TUI app has access to `sessionID` which can be passed to the memory command
- Found in `session/summary.ts:75`: `const all = await Session.messages({ sessionID: input.sessionID })`

### 2. Sub-Agent for Summarization

**Decision**: Use the existing Agent framework in `agent/agent.ts` to invoke a sub-agent for summarization.

**Rationale**:
- The codebase has a robust agent system with sub-agent support
- Mode is set to `"subagent"` for sub-agents (found in `Agent.Info` schema)
- The `ai` SDK (Vercel AI) is used for LLM interactions
- There are existing prompts for summarization in `agent/prompt/summary.txt`

**Implementation approach**:
- Create a dedicated summarization prompt based on existing `agent/prompt/summary.txt`
- Use the Agent framework with subagent mode to generate the summary
- Pass conversation messages as context to the sub-agent

### 3. Memory File Storage

**Decision**: Use existing memory file structure with timestamp/UUID for uniqueness.

**Rationale**:
- The existing memory system in `packages/opencode/src/memory/` already handles file storage
- The memory-writer module provides `addMemory` function for adding memories
- File uniqueness can be achieved with timestamp or UUID naming

### 4. Integration Points

| Component | File | How to Use |
|-----------|------|------------|
| Session messages | `session/index.ts` | `Session.messages({ sessionID })` |
| Agent invocation | `agent/agent.ts` | `Agent.create(...)` or use AI SDK directly |
| Memory writer | `memory/memory-writer.ts` | `addMemory(store, content, options)` |
| TUI command | `cli/cmd/tui/app.tsx` | Command handler already exists |

### 5. Edge Cases

- **Empty conversation**: Check if messages array is empty before invoking sub-agent
- **Long conversations**: Truncate or chunk messages if needed for token limits
- **File write failures**: Handle with try/catch and return error message
- **Sub-agent failure**: Catch errors and provide user-friendly error message

## Alternatives Considered

1. **Use existing SessionSummary**: The existing summary system focuses on diff/file changes, not conversational content summarization. Not suitable for this use case.

2. **Direct LLM call**: Could use the AI SDK directly without the Agent framework, but using Agent provides better structure and error handling.

3. **No sub-agent**: Simply save raw conversation - rejected because the feature specifically requires AI summarization.

## Technical Implementation Notes

- The /memory command handler in `app.tsx` already has access to the session context
- Need to pass `sessionID` from TUI to the memory command
- The sub-agent should return just the summary text (not tool calls)
- Memory files should be stored in the persona's memory directory with unique names
