# Implementation Plan: Personalized Memory System for HeartSpark Companion Mode

**Branch**: `001-personalized-memory` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-personalized-memory/spec.md`

## Summary

为 HeartSpark 模拟恋爱模式实现个性化记忆系统，使每个角色（Persona）能够记住与用户的互动历史、用户偏好和共同经历。参考 OpenClaw 的 Memory 文件结构记忆系统和 QMD 记忆搜索系统设计，实现基于 Markdown 文件的持久化存储和语义搜索能力。

## Technical Context

**Language/Version**: TypeScript (via Bun) | **Primary Dependencies**: Hono, Zod, SQLite (via better-sqlite3)
**Storage**: 文件系统 (Markdown files) + SQLite (QMD Index) | **Testing**: Vitest
**Target Platform**: CLI (Node.js/Bun) | **Project Type**: CLI Tool with Companion Mode
**Performance Goals**: 记忆加载 < 5秒, 搜索响应 < 2秒, 命令执行 < 2秒
**Constraints**: 离线优先架构, Markdown 即真理, 角色记忆隔离
**Scale**: 每个角色 100-500 条记忆, 支持多角色并行

## Constitution Check

*No constitution file found - proceeding without gate checks*

## Project Structure

### Documentation (this feature)

```text
specs/001-personalized-memory/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
packages/opencode/src/
├── memory/                     # NEW: Memory system module
│   ├── index.ts                # Main entry point
│   ├── file-structure.ts       # Memory file structure management
│   ├── memory-loader.ts        # Load memories on session start
│   ├── memory-writer.ts        # Write new memories
│   ├── qmd-client.ts           # QMD search integration
│   ├── flush-command.ts        # Active flush command
│   └── types.ts                # TypeScript types
├── persona/
│   ├── loader.ts               # Existing persona loader (need update)
│   └── memory-integration.ts   # NEW: Integrate memory with persona
└── cli/cmd/
    └── memory-commands.ts      # NEW: Memory CLI commands

persona/                        # Persona definitions (existing)
└── [persona_id]/
    └── memory/                 # NEW: Per-persona memory directory
        ├── MEMORY.md           # Long-term memories
        ├── SOUL.md             # Character personality
        ├── USER.md             # User info
        └── YYYY-MM-DD.md      # Daily memories
```

**Structure Decision**:
- 记忆系统作为独立模块 `packages/opencode/src/memory/`
- 每个角色的记忆存储在 `persona/<persona_id>/memory/` 目录
- 兼容现有 persona loader 架构
- QMD 作为可选后端，支持回退到内置搜索

## Complexity Tracking

> Not applicable - no constitution violations

## Phase 0: Outline & Research

### Research Tasks

1. **QMD 集成方式研究**
   - 如何在 TypeScript/Bun 环境中调用 QMD CLI
   - QMD 的索引路径配置
   - 搜索结果格式解析

2. **文件锁定机制研究**
   - Markdown 文件并发写入时的锁定策略
   - 防止数据损坏

3. **上下文压缩检测**
   - 如何检测会话即将压缩
   - 实现 Pre-compaction Ping 机制

### Unknowns to Resolve

| Unknown | Research Task |
|---------|---------------|
| QMD CLI 调用方式 | QMD 集成方式研究 |
| 文件并发写入安全 | 文件锁定机制研究 |
| 上下文压缩时机 | 上下文压缩检测研究 |

## Phase 1: Design & Contracts (Completed)

### Generated Artifacts

- `research.md` - Research findings for QMD integration, file locking, and compaction detection
- `data-model.md` - Entity definitions for Memory, MemoryStore, MemoryEntry
- `contracts/api.md` - API contracts for memory operations
- `quickstart.md` - Quick start guide

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| QMD 作为可选后端 | 成熟方案，支持混合搜索，有回退机制 |
| 文件锁 + 原子写入 | 简单可靠，适合单用户场景 |
| Token 估算触发刷新 | 与 OpenClaw 一致，实现简单 |
| OpenClaw 文件布局 | 成熟设计验证，便于 QMD 索引 |
| TUI 内嵌命令 | 用户体验最佳 |

### Constitution Check (Re-evaluation)

No constitution violations identified.
