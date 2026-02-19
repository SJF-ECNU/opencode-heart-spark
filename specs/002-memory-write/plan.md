# Implementation Plan: 恋爱模拟记忆功能增强

**Branch**: `002-memory-write` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-memory-write/spec.md`

## Summary

增强 HeartSpark 伴侣模式的记忆系统，使 AI 角色能够主动记住用户的互动。核心功能包括：
1. 放开文件写权限，让 AI 可以主动写入记忆
2. 完善系统提示词，指导 AI 何时/如何调用记忆
3. 修复用户主动写入记忆命令 (`/memory flush`)

**继承自 001-personalized-memory**:
- 记忆文件结构已创建
- 记忆加载功能已实现
- 基础写入功能已实现
- 需要增强 AI 主动写入能力

## Technical Context

**Language/Version**: TypeScript (via Bun)
**Primary Dependencies**: Hono, Zod, Bun
**Storage**: 文件系统 (Markdown files)
**Testing**: Bun test
**Target Platform**: CLI (Node.js/Bun)
**Project Type**: CLI Tool with Companion Mode

**Performance Goals**:
- 记忆加载 < 2秒
- 记忆写入 < 1秒
- 命令响应 < 500ms

**Constraints**:
- 离线优先架构
- Markdown 即真理
- 角色记忆隔离

**Scale**:
- 每个角色 100-500 条记忆
- 单用户场景

## Constitution Check

*No constitution file found - proceeding without gate checks*

## Project Structure

### Documentation (this feature)

```text
specs/002-memory-write/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md            # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
packages/opencode/src/
├── memory/                     # 已存在: 记忆系统模块
│   ├── index.ts
│   ├── file-structure.ts
│   ├── memory-loader.ts
│   ├── memory-writer.ts      # 需要: 增强写入能力
│   ├── flush-command.ts      # 需要: 修复命令触发
│   ├── qmd-client.ts
│   ├── compaction-detector.ts
│   ├── auto-flush.ts         # 需要: 集成到上下文压缩
│   └── types.ts
├── persona/
│   ├── loader.ts
│   └── memory-integration.ts # 需要: 添加写入能力
└── cli/cmd/
    ├── memory-commands.ts    # 需要: 注册到 TUI
    └── tui/
        └── thread.ts          # 需要: Enable Write tool in companion mode

persona/                       # Persona definitions
└── [persona_id]/
    └── memory/                # 已存在: 记忆目录
        ├── MEMORY.md
        ├── SOUL.md
        ├── USER.md
        └── daily/
            └── YYYY-MM-DD.md
```

## Phase 0: Outline & Research

### Research Tasks

1. **伴侣模式工具限制研究**
   - 当前 companion mode 禁止了哪些工具？
   - 如何在保持沉浸感的同时允许 Write 工具？

2. **TUI 命令注册机制研究**
   - 如何注册 `/memory` 命令？
   - 命令如何传递给 AI 处理？

3. **上下文压缩集成研究**
   - 如何在 compaction 前触发记忆保存？
   - 当前 compaction 事件机制是什么？

### Unknowns to Resolve

| Unknown | Research Task |
|---------|---------------|
| Write 工具权限 | 伴侣模式工具限制研究 |
| /memory 命令注册 | TUI 命令注册机制研究 |
| 自动保存触发 | 上下文压缩集成研究 |

## Phase 1: Design & Contracts

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| 有条件开放 Write 工具 | 限制写入路径到 persona 目录，保持安全性 |
| 命令解析 + AI 响应 | 用户输入 → 命令解析 → AI 决定是否写入 → 实际写入 |
| 订阅 compaction 事件 | 利用现有的 Bus 事件机制触发自动保存 |

### Implementation Strategy

1. **第一步**: 修改 thread.ts，在伴侣模式下允许 Write 工具（限制路径）
2. **第二步**: 完善 integration_prompt.md，添加记忆操作指令
3. **第三步**: 修复 /memory 命令注册和触发
4. **第四步**: 集成 auto-flush 到 compaction 事件

## Dependencies

```
002-memory-write 依赖 001-personalized-memory:
  - 记忆文件结构
  - 基础读写功能
  - memory-writer.ts
  - memory-loader.ts

新增依赖:
  - TUI 命令系统
  - Session compaction 事件
  - 伴侣模式工具配置
```
