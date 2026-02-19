# Feature Specification: Fix Memory Command to Use Sub-Agent Summarization

**Feature Branch**: `003-fix-memory-command`
**Created**: 2026-02-19
**Status**: Draft
**Input**: User description: "修复bug，当前的陪伴模式的记忆系统的/memory无法正常的写入记忆，我认为应该在触发/memory的时候开一个字agent总结对话的所有内容存入新文件中"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Triggers Memory Command (Priority: P1)

User is in companion mode and wants to save the current conversation to memory. User types /memory command to trigger memory saving.

**Why this priority**: This is the primary use case - users need a reliable way to save conversation memories. Without this, the companion mode cannot maintain persistent memories.

**Independent Test**: Can be tested by entering companion mode, having a conversation, typing /memory, and verifying a memory file is created with conversation summary.

**Acceptance Scenarios**:

1. **Given** user is in companion mode with conversation history, **When** user types /memory command, **Then** system captures conversation, generates summary via sub-agent, and saves to new file
2. **Given** user triggers /memory, **Then** user receives confirmation message indicating memory was saved successfully
3. **Given** user triggers /memory after new conversation, **Then** a new memory file is created (not overwriting previous)

---

### User Story 2 - User Reviews Saved Memories (Priority: P2)

User wants to retrieve and review previously saved conversation memories.

**Why this priority**: Memories are only useful if users can access them later. This enables continuity in companion interactions.

**Independent Test**: Can be tested by triggering /memory, then verifying the saved file exists and contains the conversation summary.

**Acceptance Scenarios**:

1. **Given** memory files exist, **When** user requests memory retrieval, **Then** system loads and displays relevant memories

---

### Edge Cases

- What happens when conversation is empty (no messages)?
- How does system handle very long conversations (token limits)?
- What happens if file write fails (permissions, disk space)?
- What if sub-agent fails to generate summary?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST capture complete conversation content when /memory command is triggered
- **FR-002**: System MUST use sub-agent to generate summary of captured conversation
- **FR-003**: System MUST save generated summary to a new file in designated memory directory
- **FR-004**: System MUST provide user feedback indicating success or failure of memory save operation
- **FR-005**: Each /memory invocation MUST create a unique file (timestamp or UUID based)
- **FR-006**: System MUST handle errors gracefully and inform user of failures

### Key Entities *(include if feature involves data)*

- **Conversation**: Contains all user and assistant messages in current session
- **Memory Summary**: AI-generated concise summary of conversation content
- **Memory File**: Persistent file storage for memory summaries

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can trigger /memory and receive confirmation within 30 seconds
- **SC-002**: Memory files are successfully created with valid content (not empty) in at least 95% of attempts
- **SC-003**: Users can retrieve previously saved memories with 100% success rate when files exist
- **SC-004**: System handles edge cases gracefully without crashes or hanging

## Assumptions

- Memory files are stored in a designated directory (e.g., ~/.opencode/memories/ or project-specific)
- File naming convention uses timestamp or UUID to ensure uniqueness
- Sub-agent has access to conversation context for summarization
- No specific summarization length limit - sub-agent determines appropriate level of detail
