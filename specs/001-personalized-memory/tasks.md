# Tasks: Personalized Memory System for HeartSpark Companion Mode

**Feature**: Personalized Memory System | **Branch**: `001-personalized-memory`
**Generated**: 2026-02-19

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 28 |
| Phases | 9 |
| User Stories | 7 |

## Task Count Per User Story

| User Story | Priority | Tasks |
|------------|----------|-------|
| US1 - 角色记忆文件结构 | P1 | 5 |
| US2 - 角色对用户的记忆 | P1 | 4 |
| US3 - 角色人格记忆 | P1 | 3 |
| US4 - QMD 记忆搜索 | P2 | 4 |
| US5 - 记忆自动刷新机制 | P2 | 3 |
| US6 - 用户记忆管理 | P2 | 4 |
| US7 - 主动记忆刷新命令 | P1 | 3 |

## Phase 1: Setup (Project Initialization)

- [X] T001 Create memory module directory structure in packages/opencode/src/memory/
- [X] T002 [P] Create types.ts with Memory, MemoryStore, MemoryEntry interfaces in packages/opencode/src/memory/types.ts
- [X] T003 [P] Create index.ts export file in packages/opencode/src/memory/index.ts

## Phase 2: Foundational (Common Components)

- [X] T004 Implement file structure management in packages/opencode/src/memory/file-structure.ts
- [X] T005 Create MemoryStore class for path management in packages/opencode/src/memory/memory-store.ts
- [X] T006 Implement base memory loader in packages/opencode/src/memory/memory-loader.ts
- [X] T007 Implement base memory writer in packages/opencode/src/memory/memory-writer.ts
- [X] T008 Integrate memory module with persona loader in packages/opencode/src/persona/memory-integration.ts

## Phase 3: US1 - 角色记忆文件结构 (P1)

**Goal**: 为每个角色创建独立的记忆目录结构

**Independent Test**: 检查角色目录是否包含正确的文件结构

- [X] T009 [P] [US1] Implement initMemoryStore function in packages/opencode/src/memory/file-structure.ts
- [X] T010 [P] [US1] Create template files (MEMORY.md, SOUL.md, USER.md) in packages/opencode/src/memory/file-structure.ts
- [X] T011 [US1] Implement getDailyMemoryPath function in packages/opencode/src/memory/file-structure.ts
- [X] T012 [US1] Auto-create memory directory on persona load in packages/opencode/src/persona/memory-integration.ts
- [X] T013 [US1] Write test for memory file structure initialization

## Phase 4: US2 + US3 - 角色记忆功能 (P1)

**Goal**: 实现角色对用户和人格的记忆功能

**Independent Test**: 在新会话中验证角色是否能回忆之前的信息

- [X] T014 [P] [US2] Implement addMemory function in packages/opencode/src/memory/memory-writer.ts
- [X] T015 [P] [US2] Implement loadMemories function in packages/opencode/src/memory/memory-loader.ts
- [X] T016 [US2] Implement appendToDailyMemory function in packages/opencode/src/memory/memory-writer.ts
- [X] T017 [US2] Implement appendToLongTermMemory function in packages/opencode/src/memory/memory-writer.ts
- [X] T018 [P] [US3] Implement savePersonalityMemory function in packages/opencode/src/memory/memory-writer.ts
- [X] T019 [US3] Implement loadPersonalityMemory function in packages/opencode/src/memory/memory-loader.ts
- [X] T020 [US3] Integrate memory loading into persona session start

## Phase 5: US4 - QMD 记忆搜索 (P2)

**Goal**: 实现基于 QMD 的语义搜索功能

**Independent Test**: 搜索特定主题能找到相关记忆

- [X] T021 [P] [US4] Implement QMD client wrapper in packages/opencode/src/memory/qmd-client.ts
- [X] T022 [P] [US4] Implement searchMemories function with BM25 support in packages/opencode/src/memory/qmd-client.ts
- [X] T023 [US4] Implement searchMemories function with vector support in packages/opencode/src/memory/qmd-client.ts
- [X] T024 [US4] Implement fallback search when QMD unavailable in packages/opencode/src/memory/qmd-client.ts

## Phase 6: US5 - 记忆自动刷新机制 (P2)

**Goal**: 实现 Pre-compaction Ping 自动刷新

**Independent Test**: 模拟上下文压缩场景验证记忆保存

- [X] T025 [P] [US5] Implement token estimation utility in packages/opencode/src/memory/compaction-detector.ts
- [X] T026 [US5] Implement shouldTriggerMemoryFlush function in packages/opencode/src/memory/compaction-detector.ts
- [X] T027 [US5] Implement auto-flush hook in session manager

## Phase 7: US6 - 用户记忆管理 (P2)

**Goal**: 实现查看、导出、删除记忆功能

**Independent Test**: 用户可以成功管理自己的记忆数据

- [X] T028 [P] [US6] Implement viewMemories function in packages/opencode/src/memory/memory-loader.ts
- [X] T029 [P] [US6] Implement deleteMemory function in packages/opencode/src/memory/memory-writer.ts
- [X] T030 [US6] Implement exportMemories function in packages/opencode/src/memory/export.ts
- [X] T031 [US6] Create memory-commands.ts CLI handlers in packages/opencode/src/cli/cmd/memory-commands.ts

## Phase 8: US7 - 主动记忆刷新命令 (P1)

**Goal**: 实现用户主动触发的记忆刷新命令

**Independent Test**: 执行命令后验证记忆是否正确保存

- [X] T032 [P] [US7] Implement flushMemory command in packages/opencode/src/memory/flush-command.ts
- [X] T033 [US7] Implement flush with custom content support in packages/opencode/src/memory/flush-command.ts
- [X] T034 [US7] Register /memory flush command in TUI command system

## Phase 9: Polish & Integration

- [X] T035 Add memory system to companion mode startup flow
- [X] T036 Add error handling for corrupted memory files
- [X] T037 Update persona loader to include memory context in prompts

## Dependencies

```
US1 (Phase 3) ─┬─► US2 (Phase 4) ─┬─► US4 (Phase 5)
                │                   │
                └───────────────────┼─► US5 (Phase 6)
                                    │
US7 (Phase 8) ◄─────────────────────┘

All user stories depend on:
  - Phase 1 (Setup)
  - Phase 2 (Foundational)

US6 (Phase 7) depends on US2/US3 completion for base functionality
```

## Parallel Opportunities

| Tasks | Reason |
|-------|--------|
| T002, T003 | Different files, no dependencies |
| T009, T010, T011 | Different functions in same file |
| T014, T015 | Different operations |
| T021, T022 | Different search modes |
| T028, T029 | Different operations |
| T032, T033 | Different flush modes |

## MVP Scope

**Recommended MVP**: Phase 1 + Phase 2 + Phase 3 + Phase 8 (US1 + US7)

This includes:
- 记忆文件结构 (US1)
- 主动记忆刷新命令 (US7)
- 基础加载和写入功能

This delivers core value: 角色能够记住用户信息，用户可以主动保存记忆

## Implementation Strategy

1. **Sprint 1**: Phase 1-2 (Setup + Foundational) - 基础架构
2. **Sprint 2**: Phase 3 (US1) - 文件结构
3. **Sprint 3**: Phase 4 (US2 + US3) - 核心记忆功能
4. **Sprint 4**: Phase 5-6 (US4 + US5) - 搜索 + 自动刷新
5. **Sprint 5**: Phase 7-8 (US6 + US7) - 用户管理 + 命令
6. **Sprint 6**: Phase 9 - Polish
