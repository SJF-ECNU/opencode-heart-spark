# Companion Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add virtual companion/chat mode to OpenCode using `--companion` flag, preserving existing code editing functionality.

**Architecture:** New companion mode adds a startup flow that: 1) parses `--companion` flag, 2) shows role selection UI, 3) loads role `.md` files as system prompt, 4) enters chat mode without working directory. Existing code editing mode remains unchanged.

**Tech Stack:** TypeScript, Bun, yargs (CLI), existing Agent/SDK infrastructure

---

## Task 1: Create Default Persona Directory Structure

**Files:**
- Create: `persona/default/00_metadata/version.md`
- Create: `persona/default/00_metadata/design_principles.md`
- Create: `persona/default/01_identity/basic_profile.md`
- Create: `persona/default/01_identity/appearance.md`
- Create: `persona/default/01_identity/temperament_tags.md`
- Create: `persona/default/01_identity/public_image.md`
- Create: `persona/default/02_psychological_core/attachment_style.md`
- Create: `persona/default/02_psychological_core/core_beliefs.md`
- Create: `persona/default/02_psychological_core/values.md`
- Create: `persona/default/02_psychological_core/fears.md`
- Create: `persona/default/02_psychological_core/insecurities.md`
- Create: `persona/default/02_psychological_core/self_concept.md`
- Create: `persona/default/03_cognitive_model/decision_logic.md`
- Create: `persona/default/03_cognitive_model/moral_framework.md`
- Create: `persona/default/03_cognitive_model/conflict_evaluation.md`
- Create: `persona/default/03_cognitive_model/jealousy_logic.md`
- Create: `persona/default/04_emotional_system/baseline_emotion.md`
- Create: `persona/default/04_emotional_system/positive_triggers.md`
- Create: `persona/default/04_emotional_system/negative_triggers.md`
- Create: `persona/default/04_emotional_system/shame_triggers.md`
- Create: `persona/default/04_emotional_system/anger_pattern.md`
- Create: `persona/default/04_emotional_system/affection_expression.md`
- Create: `persona/default/05_behavior_system/speech_style/tone.md`
- Create: `persona/default/05_behavior_system/speech_style/texting_pattern.md`
- Create: `persona/default/05_behavior_system/speech_style/humor_style.md`
- Create: `persona/default/05_behavior_system/speech_style/flirting_style.md`
- Create: `persona/default/05_behavior_system/conflict_behavior.md`
- Create: `persona/default/05_behavior_system/intimacy_behavior.md`
- Create: `persona/default/05_behavior_system/withdrawal_behavior.md`
- Create: `persona/default/06_relationship_framework/ideal_partner.md`
- Create: `persona/default/06_relationship_framework/boundaries.md`
- Create: `persona/default/06_relationship_framework/attachment_dynamics.md`
- Create: `persona/default/06_relationship_framework/commitment_logic.md`
- Create: `persona/default/06_relationship_framework/breakup_conditions.md`
- Create: `persona/default/06_relationship_framework/reconciliation_logic.md`
- Create: `persona/default/system/integration_prompt.md`
- Create: `persona/default/system/consistency_rules.md`

**Step 1: Create directory structure**

Run:
```bash
mkdir -p persona/default/{00_metadata,01_identity,02_psychological_core,03_cognitive_model,04_emotional_system,05_behavior_system/speech_style,06_relationship_framework,system}
```

**Step 2: Create sample persona files**

Create each file with minimal sample content. For example:

```markdown
# version.md
# 1.0.0
```

```markdown
# design_principles.md
# This persona is designed to be...
```

```markdown
# basic_profile.md
## Name
[Your Name]

## Age
[Age]

## Background
[Brief background story]
```

Continue creating all 35 files with appropriate minimal content.

**Step 3: Commit**

```bash
git add persona/
git commit -m "feat: add default persona directory structure"
```

---

## Task 2: Create Persona Loader Utility

**Files:**
- Create: `packages/opencode/src/persona/loader.ts`
- Test: `packages/opencode/src/persona/loader.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/opencode/src/persona/loader.test.ts
import { describe, it, expect, beforeAll } from "bun:test";
import { loadPersona, listPersonas, type PersonaInfo } from "./loader";
import { resolve } from "path";

const PERSONA_PATH = resolve(import.meta.dir, "../../../../persona");

describe("loadPersona", () => {
  it("should load default persona", async () => {
    const persona = await loadPersona(PERSONA_PATH, "default");
    expect(persona.systemPrompt).toContain("integration_prompt");
    expect(persona.files).toBeGreaterThan(0);
  });

  it("should return null for non-existent persona", async () => {
    const persona = await loadPersona(PERSONA_PATH, "nonexistent");
    expect(persona).toBeNull();
  });
});

describe("listPersonas", () => {
  it("should list available personas", async () => {
    const personas = await listPersonas(PERSONA_PATH);
    expect(personas.length).toBeGreaterThan(0);
    expect(personas[0]?.name).toBe("default");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun test packages/opencode/src/persona/loader.test.ts`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```typescript
// packages/opencode/src/persona/loader.ts
import { readdir, readFile } from "fs/promises";
import { resolve, join } from "path";

export interface PersonaInfo {
  name: string;
  path: string;
}

export interface Persona {
  systemPrompt: string;
  files: number;
}

const LOAD_ORDER = [
  "system/integration_prompt.md",
  "system/consistency_rules.md",
  "01_identity/basic_profile.md",
  "01_identity/appearance.md",
  "01_identity/temperament_tags.md",
  "01_identity/public_image.md",
  "02_psychological_core/attachment_style.md",
  "02_psychological_core/core_beliefs.md",
  "02_psychological_core/values.md",
  "02_psychological_core/fears.md",
  "02_psychological_core/insecurities.md",
  "02_psychological_core/self_concept.md",
  "03_cognitive_model/decision_logic.md",
  "03_cognitive_model/moral_framework.md",
  "03_cognitive_model/conflict_evaluation.md",
  "03_cognitive_model/jealousy_logic.md",
  "04_emotional_system/baseline_emotion.md",
  "04_emotional_system/positive_triggers.md",
  "04_emotional_system/negative_triggers.md",
  "04_emotional_system/shame_triggers.md",
  "04_emotional_system/anger_pattern.md",
  "04_emotional_system/affection_expression.md",
  "05_behavior_system/speech_style/tone.md",
  "05_behavior_system/speech_style/texting_pattern.md",
  "05_behavior_system/speech_style/humor_style.md",
  "05_behavior_system/speech_style/flirting_style.md",
  "05_behavior_system/conflict_behavior.md",
  "05_behavior_system/intimacy_behavior.md",
  "05_behavior_system/withdrawal_behavior.md",
  "06_relationship_framework/ideal_partner.md",
  "06_relationship_framework/boundaries.md",
  "06_relationship_framework/attachment_dynamics.md",
  "06_relationship_framework/commitment_logic.md",
  "06_relationship_framework/breakup_conditions.md",
  "06_relationship_framework/reconciliation_logic.md",
];

export async function listPersonas(basePath: string): Promise<PersonaInfo[]> {
  const entries = await readdir(basePath, { withFileTypes: true });
  const personas: PersonaInfo[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      personas.push({
        name: entry.name,
        path: resolve(basePath, entry.name),
      });
    }
  }

  return personas.sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadPersona(basePath: string, name: string): Promise<Persona | null> {
  const personaPath = resolve(basePath, name);

  try {
    const parts: string[] = [];
    let fileCount = 0;

    for (const file of LOAD_ORDER) {
      const filePath = join(personaPath, file);
      try {
        const content = await readFile(filePath, "utf-8");
        parts.push(content);
        fileCount++;
      } catch {
        // File doesn't exist, skip
      }
    }

    if (parts.length === 0) {
      return null;
    }

    return {
      systemPrompt: parts.join("\n\n"),
      files: fileCount,
    };
  } catch {
    return null;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `bun test packages/opencode/src/persona/loader.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/opencode/src/persona/
git commit -m "feat: add persona loader utility"
```

---

## Task 3: Add --companion Flag to Run Command

**Files:**
- Modify: `packages/opencode/src/cli/cmd/run.ts:215-294`

**Step 1: Add the companion option to the builder**

Add to the `builder` function around line 293 (after "thinking" option):

```typescript
.option("companion", {
  alias: ["companion"],
  describe: "enter companion mode for virtual partner chat",
  type: "boolean",
})
```

**Step 2: Test the flag is recognized**

Run: `bun run packages/opencode/src/index.ts run --help`
Expected: Should show `--companion` in the options list

**Step 3: Commit**

```bash
git add packages/opencode/src/cli/cmd/run.ts
git commit -m "feat: add --companion flag to run command"
```

---

## Task 4: Implement Companion Mode Flow

**Files:**
- Modify: `packages/opencode/src/cli/cmd/run.ts:295-330`
- Create: `packages/opencode/src/persona/cli.ts`

**Step 1: Create CLI helper for companion mode**

```typescript
// packages/opencode/src/persona/cli.ts
import { UI } from "../cli/ui";
import { listPersonas, type PersonaInfo } from "./loader";
import { resolve } from "path";

const DEFAULT_PERSONA_PATH = resolve(process.cwd(), "persona");

export async function selectPersona(): Promise<string | null> {
  const personas = await listPersonas(DEFAULT_PERSONA_PATH);

  if (personas.length === 0) {
    UI.error("No personas found in persona/ directory");
    return null;
  }

  UI.println(UI.Style.TEXT_BOLD + "Select a companion:" + UI.Style.TEXT_NORMAL);
  UI.empty();

  for (let i = 0; i < personas.length; i++) {
    const p = personas[i];
    UI.println(`  ${i + 1}. ${p.name}`);
  }

  UI.empty();
  const choice = await UI.input("Enter number (or press Enter for default): ");

  if (!choice.trim()) {
    return personas[0]?.name ?? null;
  }

  const idx = parseInt(choice, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= personas.length) {
    UI.error("Invalid selection");
    return null;
  }

  return personas[idx].name;
}
```

**Step 2: Add companion mode handler in run.ts**

Add after line ~295 in the handler:

```typescript
// Companion mode
if (args.companion) {
  const personaPath = resolve(process.cwd(), "persona");
  const { loadPersona } = await import("../../persona/loader");

  const selectedPersona = await selectPersona();
  if (!selectedPersona) {
    UI.error("No persona selected, exiting");
    process.exit(1);
  }

  const persona = await loadPersona(personaPath, selectedPersona);
  if (!persona) {
    UI.error(`Failed to load persona: ${selectedPersona}`);
    process.exit(1);
  }

  UI.success(`Loaded companion: ${selectedPersona}`);
  // TODO: Initialize SDK with persona system prompt
  // For now, we continue to normal flow but with modified system prompt
}
```

**Step 3: Test the companion flag**

Run: `bun run packages/opencode/src/index.ts run --companion`
Expected: Should show persona selection prompt (may fail if no persona yet, but flow should work)

**Step 4: Commit**

```bash
git add packages/opencode/src/persona/cli.ts packages/opencode/src/cli/cmd/run.ts
git commit -m "feat: implement companion mode selection flow"
```

---

## Task 5: Integrate Persona System Prompt with Agent

**Files:**
- Modify: `packages/opencode/src/session/prompt.ts`
- Modify: `packages/opencode/src/cli/cmd/run.ts`

**Step 1: Understand how system prompt is built**

Look at `packages/opencode/src/session/prompt.ts` to find where system messages are constructed. This typically involves reading project files, agent instructions, etc.

**Step 2: Modify to accept optional persona system prompt**

Add a parameter to pass extra system prompt content that gets prepended to the normal system prompt:

```typescript
// In the prompt building function, add optional personaPrompt parameter
export async function buildSystemPrompt(options: {
  // ... existing options
  personaPrompt?: string;
}) {
  // ... existing logic

  // Prepend persona prompt if provided
  if (options.personaPrompt) {
    parts.unshift(options.personaPrompt);
  }

  // ... rest of logic
}
```

**Step 3: Pass persona prompt from run.ts**

Modify the companion mode code to load the persona and pass it to the session:

```typescript
if (args.companion) {
  const personaPath = resolve(process.cwd(), "persona");
  const { loadPersona } = await import("../../persona/loader");

  const selectedPersona = await selectPersona();
  if (!selectedPersona) {
    UI.error("No persona selected, exiting");
    process.exit(1);
  }

  const persona = await loadPersona(personaPath, selectedPersona);
  if (!persona) {
    UI.error(`Failed to load persona: ${selectedPersona}`);
    process.exit(1);
  }

  // Store persona system prompt to pass to session
  (globalThis as any).__PERSONA_SYSTEM_PROMPT__ = persona.systemPrompt;
}
```

Then in the session creation/prompt, check for this global and prepend it.

**Step 4: Test companion mode with persona**

Run: `bun run packages/opencode/src/index.ts run --companion`
Select "default" persona
Enter a chat message like "Hello, how are you?"
Expected: Agent responds in the persona's style

**Step 5: Commit**

```bash
git add packages/opencode/src/session/prompt.ts packages/opencode/src/cli/cmd/run.ts
git commit -m "feat: integrate persona system prompt with agent"
```

---

## Task 6: Add Default Companion Permission Mode

**Files:**
- Modify: `packages/opencode/src/cli/cmd/run.ts`

**Step 1: Add default permission for companion mode**

In companion mode, use more permissive default settings. Add near the companion mode handling:

```typescript
if (args.companion) {
  // ... existing code

  // Set default permissions to allow all for companion mode
  args.permission = "all"; // or appropriate default
}
```

**Step 2: Commit**

```bash
git add packages/opencode/src/cli/cmd/run.ts
git commit -m "feat: add default permissive permissions for companion mode"
```

---

## Task 7: Verify Full Flow

**Step 1: Run full companion mode test**

```bash
bun run packages/opencode/src/index.ts run --companion
```

**Step 2: Verify:**
- [ ] Persona selection shows
- [ ] Can select default persona
- [ ] Chat works with persona personality
- [ ] Regular mode still works: `bun run packages/opencode/src/index.ts run`

**Step 3: Commit any fixes**

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Create default persona directory with 35 sample files |
| 2 | Create persona loader utility with tests |
| 3 | Add --companion flag |
| 4 | Implement companion mode selection flow |
| 5 | Integrate persona system prompt with agent |
| 6 | Add default companion permissions |
| 7 | Verify full flow |
