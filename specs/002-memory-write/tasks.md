# Tasks: 恋爱模拟记忆功能增强

**Feature**: 恋爱模拟记忆功能增强 | **Branch**: `002-memory-write`
**Generated**: 2026-02-19

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 16 |
| Phases | 5 |
| User Stories | 4 |

## Task Count Per User Story

| User Story | Priority | Tasks |
|------------|----------|-------|
| US1 - AI主动记录用户重要信息 | P1 | 4 |
| US2 - AI清楚何时调用记忆功能 | P1 | 4 |
| US3 - 用户主动写入记忆命令生效 | P1 | 4 |
| US4 - 上下文压缩前自动保存 | P2 | 4 |

## Phase 1: Setup (Project Initialization)

- [X] T001 Review current memory module implementation in packages/opencode/src/memory/
- [X] T002 Verify existing memory-writer.ts and memory-loader.ts functions for enhancement points

## Phase 2: Foundational (Common Components)

- [X] T003 Modify thread.ts to enable Write tool in companion mode with path restriction in packages/opencode/src/cli/cmd/tui/thread.ts
- [X] T004 Add path validation for Write tool to only allow persona/memory directory in packages/opencode/src/cli/cmd/tui/thread.ts

## Phase 3: US1 - AI主动记录用户重要信息 (P1)

**Goal**: AI角色能够主动记住用户分享的重要信息

**Independent Test**: 用户告诉AI"我叫小明"，AI回应并保存到USER.md

- [X] T005 [P] [US1] Update integration_prompt.md with memory write instructions in persona/shorekeeper/system/integration_prompt.md
- [X] T006 [US1] Add Write tool permission check for persona memory path in packages/opencode/src/cli/cmd/tui/thread.ts
- [ ] T007 [US1] Test AI can write to USER.md when user shares information
- [ ] T008 [US1] Verify AI acknowledges user input after saving memory

## Phase 4: US2 - AI清楚何时调用记忆功能 (P1)

**Goal**: AI知道何时读取记忆、何时写入新信息

**Independent Test**: AI在对话中自然引用之前保存的用户偏好

- [X] T009 [P] [US2] Add memory read instructions to integration_prompt.md in persona/shorekeeper/system/integration_prompt.md
- [X] T010 [US2] Add memory search guidance to persona prompt in persona/shorekeeper/system/integration_prompt.md
- [ ] T011 [US2] Test AI references stored preferences without user prompting
- [ ] T012 [US2] Verify AI reads MEMORY.md when user asks about past conversations

## Phase 5: US3 - 用户主动写入记忆命令生效 (P1)

**Goal**: /memory flush 命令能够正确保存内容

**Independent Test**: 用户输入 /memory flush 记得我喜欢喝美式咖啡，命令执行并保存

- [X] T013 [P] [US3] Register /memory command in TUI command system in packages/opencode/src/cli/cmd/memory-commands.ts
- [X] T014 [US3] Implement command parsing for /memory flush in packages/opencode/src/cli/cmd/memory-commands.ts
- [ ] T015 [US3] Test /memory flush saves content to daily memory file
- [ ] T016 [US3] Verify error handling when memory write fails

## Phase 6: US4 - 上下文压缩前自动保存 (P2)

**Goal**: 在上下文压缩前自动保存重要记忆

**Independent Test**: 模拟长对话触发压缩，验证记忆已保存

- [X] T017 [P] [US4] Verify auto-flush.ts subscription to SessionCompaction.Event.Compacted in packages/opencode/src/memory/auto-flush.ts
- [X] T018 [US4] Test auto-save triggers before context compaction
- [X] T019 [US4] Verify saved content persists after compaction
- [X] T020 [US4] Handle edge case when memory file is locked during auto-save

## Dependencies

```
Phase 2 ─┬─► Phase 3 (US1) ─┬─► Phase 5 (US3)
         │                   │
         └───────────────────┼─► Phase 4 (US2)
                           │
                           └─► Phase 6 (US4)

All user stories depend on:
  - Phase 1 (Setup)
  - Phase 2 (Foundational)
```

## Parallel Opportunities

| Tasks | Reason |
|-------|--------|
| T005, T009 | Different sections of integration prompt, no dependencies |
| T013, T017 | Different components, no shared state |
| T003, T004 | Sequential - enable Write first, then add validation |

## MVP Scope

**Recommended MVP**: Phase 1 + Phase 2 + Phase 3 + Phase 4 (US1 + US2)

This includes:
- Write 工具权限开放
- 记忆操作提示词更新
- AI主动记录能力

This delivers core value: AI角色能够记住用户的信息

## Implementation Strategy

1. **Sprint 1**: Phase 1-2 (Setup + Foundational) - 基础架构
2. **Sprint 2**: Phase 3 (US1) - AI主动记录
3. **Sprint 3**: Phase 4 (US2) - 记忆读取指引
4. **Sprint 4**: Phase 5 (US3) - 命令修复
5. **Sprint 5**: Phase 6 (US4) - 自动保存
