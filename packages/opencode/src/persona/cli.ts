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

  UI.println(UI.Style.TEXT_SUCCESS + "Select a companion:" + UI.Style.TEXT_NORMAL);
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
