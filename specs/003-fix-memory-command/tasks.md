---

description: "Task list for Fix Memory Command feature"
---

# Tasks: Fix Memory Command

**Input**: Design documents from `/specs/003-fix-memory-command/`
**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure needed before user stories can be implemented

- [X] T001 Explore existing memory module structure in packages/opencode/src/memory/
- [X] T002 [P] Examine current memory-commands.ts implementation in packages/opencode/src/cli/cmd/memory-commands.ts
- [X] T003 [P] Examine TUI app.tsx to understand /memory command handler in packages/opencode/src/cli/cmd/tui/app.tsx
- [X] T004 Review existing memory-writer.ts in packages/opencode/src/memory/memory-writer.ts

**Checkpoint**: Foundation ready - can proceed to user story implementation

---

## Phase 2: User Story 1 - User Triggers Memory Command (Priority: P1) 🎯 MVP

**Goal**: Enable users to trigger /memory command to save conversation summary via sub-agent to a unique file

**Independent Test**: Enter companion mode, have a conversation, type /memory, verify a memory file is created with conversation summary

### Implementation for User Story 1

- [X] T005 [P] [US1] Add unique filename generation (timestamp_UUID) in packages/opencode/src/memory/memory-writer.ts
- [X] T006 [P] [US1] Add saveMemoryToFile function with persona parameter in packages/opencode/src/memory/memory-writer.ts
- [X] T007 [US1] Implement summarizeConversation function using sub-agent in packages/opencode/src/cli/cmd/memory-commands.ts
- [X] T008 [US1] Update cmdFlushMemory to use sub-agent summarization in packages/opencode/src/cli/cmd/memory-commands.ts
- [X] T009 [US1] Pass sessionID from TUI app.tsx to memory command handler in packages/opencode/src/cli/cmd/tui/app.tsx
- [X] T010 [US1] Add error handling for empty conversation, file write failures, and sub-agent failures in packages/opencode/src/cli/cmd/memory-commands.ts
- [X] T011 [US1] Add user confirmation message after successful memory save in packages/opencode/src/cli/cmd/memory-commands.ts

**Checkpoint**: User Story 1 complete - /memory command should save unique file with summary

---

## Phase 3: User Story 2 - User Reviews Saved Memories (Priority: P2)

**Goal**: Enable users to retrieve and view previously saved conversation memories

**Independent Test**: Trigger /memory, then verify the saved file exists and contains the conversation summary

### Implementation for User Story 2

- [X] T012 [P] [US2] Implement loadMemoryFiles function in packages/opencode/src/memory/memory-loader.ts
- [X] T013 [US2] Add getMemoryBySession function in packages/opencode/src/memory/memory-loader.ts
- [X] T014 [US2] Integrate memory retrieval with TUI in packages/opencode/src/cli/cmd/tui/app.tsx
- [X] T015 [US2] Add error handling for missing files and empty memory directory in packages/opencode/src/memory/memory-loader.ts

**Checkpoint**: User Stories 1 and 2 both functional and independently testable

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T016 [P] Run existing tests to verify no regressions in packages/opencode/
- [X] T017 Add logging for memory save/load operations
- [ ] T018 [P] Test edge cases: empty conversation, long conversations, file write failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies - explores existing code
- **User Story 1 (Phase 2)**: Depends on Foundational phase - MVP
- **User Story 2 (Phase 3)**: Can start after Foundational - integrates with US1 but independently testable
- **Polish (Phase 4)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Uses same memory module but independently testable

### Within Each User Story

- Models/Types before services
- Services before handlers
- Implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- Foundational tasks T001, T002, T003, T004 can run in parallel
- US1 tasks T005, T006 can run in parallel
- US2 tasks T012, T018 can run in parallel
- Polish tasks T016, T018 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch T005 and T006 in parallel (both in memory-writer.ts, no dependencies):
Task: "Add unique filename generation (timestamp_UUID) in packages/opencode/src/memory/memory-writer.ts"
Task: "Add saveMemoryToFile function with persona parameter in packages/opencode/src/memory/memory-writer.ts"

# Launch T007, T008, T009 in parallel (different files):
Task: "Implement summarizeConversation function using sub-agent in packages/opencode/src/cli/cmd/memory-commands.ts"
Task: "Pass sessionID from TUI app.tsx to memory command handler in packages/opencode/src/cli/cmd/tui/app.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational exploration
2. Complete Phase 2: User Story 1
3. **STOP and VALIDATE**: Test /memory command creates unique file with summary
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add Polish phase → Finalize
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
