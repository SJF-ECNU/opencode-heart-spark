import { describe, it, expect, beforeAll } from "bun:test";
import { loadPersona, listPersonas, type PersonaInfo } from "./loader";
import { resolve } from "path";

const PERSONA_PATH = resolve(import.meta.dir, "../../../../persona");

describe("loadPersona", () => {
  it("should load default persona with dynamic file index", async () => {
    const persona = await loadPersona(PERSONA_PATH, "default");
    expect(persona?.systemPrompt).toContain("可用角色文件");
    expect(persona?.files).toBeGreaterThan(0);
    expect(persona?.fileIndex).toContain("可用角色文件");
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
    expect(personas.some(p => p.name === "default")).toBe(true);
  });
});
