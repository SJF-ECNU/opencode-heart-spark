# Quickstart: Fix Memory Command

## Overview

This feature fixes the /memory command in companion mode to use a sub-agent for summarizing conversation content and saving to a new unique file.

## Prerequisites

- Bun runtime
- OpenCode CLI installed
- Persona loaded in companion mode

## Usage

1. Start OpenCode in companion mode:
   ```bash
   opencode --companion
   ```

2. Have a conversation with the companion

3. Trigger memory save:
   ```
   /memory
   ```

4. The system will:
   - Capture the conversation
   - Use a sub-agent to summarize
   - Save to a new unique memory file
   - Display confirmation message

## Files Modified

| File | Purpose |
|------|---------|
| `packages/opencode/src/cli/cmd/memory-commands.ts` | Add sub-agent summarization logic |
| `packages/opencode/src/memory/flush-command.ts` | Update flush to use summarization |
| `packages/opencode/src/memory/memory-writer.ts` | Add file save with unique naming |
| `packages/opencode/src/cli/cmd/tui/app.tsx` | Pass sessionID to memory command |

## Testing

```bash
# Run memory tests
bun test packages/opencode/src/memory/memory.test.ts
```

## Troubleshooting

- **Memory not initializing**: Ensure persona is loaded with `initializePersonaMemory`
- **Sub-agent fails**: Check API key and network connectivity
- **File write fails**: Check permissions for memory directory
