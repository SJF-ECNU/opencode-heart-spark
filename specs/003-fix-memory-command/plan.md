# Implementation Plan: Fix Memory Command

**Branch**: `003-fix-memory-command` | **Date**: 2026-02-19 | **Spec**: `specs/003-fix-memory-command/spec.md`
**Input**: Feature specification from `/specs/003-fix-memory-command/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Fix the /memory command in companion mode to properly capture conversation history, use a sub-agent to summarize the conversation content, and save the summary to a new unique file.

## Technical Context

**Language/Version**: TypeScript, Bun runtime
**Primary Dependencies**: Existing memory modules (memory-writer, memory-loader, memory-store), TUI components
**Storage**: File-based (memory files stored in persona memory directory)
**Testing**: Bun test (existing test infrastructure in packages/opencode)
**Target Platform**: CLI tool with TUI interface
**Project Type**: Single CLI application
**Performance Goals**: Sub-agent summarization should complete within 30 seconds
**Constraints**: Must work within existing companion mode flow, handle edge cases gracefully
**Scale/Scope**: Single feature enhancement to existing memory system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: The constitution.md file is empty (template only). No gates to evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/003-fix-memory-command/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
packages/opencode/src/
├── cli/cmd/
│   ├── memory-commands.ts    # Existing CLI commands for memory
│   └── tui/
│       ├── app.tsx          # TUI app with /memory command handler
│       └── thread.ts        # Thread command with companion mode setup
├── memory/
│   ├── index.ts             # Memory module exports
│   ├── flush-command.ts     # Current flush command implementation
│   ├── memory-writer.ts     # Memory writing logic
│   ├── memory-loader.ts     # Memory loading logic
│   └── types.ts             # Memory types
└── persona/
    ├── memory-integration.ts # Persona memory integration
    └── index.ts             # Persona exports
```

**Structure Decision**: Single TypeScript CLI project. Memory feature already exists in packages/opencode/src/memory/. The fix involves modifying existing memory-commands.ts and related files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A - No violations | - | - |
