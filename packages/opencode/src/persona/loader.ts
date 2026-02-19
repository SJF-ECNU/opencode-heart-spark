import { readdir, readFile } from "fs/promises";
import { resolve, join } from "path";

export interface PersonaInfo {
  name: string;
  path: string;
}

export interface Persona {
  systemPrompt: string;
  files: number;
  fileIndex: string; // 动态生成的文件索引
}

// 动态扫描角色目录，生成文件索引
async function generateFileIndex(personaPath: string): Promise<string> {
  const entries = await readdir(personaPath, { withFileTypes: true, recursive: true });

  // 按文件夹分组
  const grouped: Record<string, string[]> = {};
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const dir = entry.name.includes("/") ? entry.name.split("/")[0] : "root";
    if (!grouped[dir]) grouped[dir] = [];
    grouped[dir].push(entry.name);
  }

  // 生成索引
  let index = `## 可用角色文件\n\n`;
  index += `共 ${Object.values(grouped).flat().length} 个文件：\n\n`;

  for (const [dir, fileList] of Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))) {
    index += `### ${dir}/\n`;
    for (const file of fileList.sort()) {
      const name = file.replace(dir + "/", "").replace(".md", "");
      index += `- ${file} - ${formatFileName(name)}\n`;
    }
    index += "\n";
  }

  index += `\n使用 ReadTool 读取这些文件来了解角色详情。`;
  return index;
}

function formatFileName(name: string): string {
  return name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

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

// 优先加载顺序（固定的核心文件）
const PRIORITY_FILES = [
  "system/integration_prompt.md",
  "system/consistency_rules.md",
];

export async function loadPersona(basePath: string, name: string): Promise<Persona | null> {
  const personaPath = resolve(basePath, name);

  try {
    // 1. 动态生成文件索引（放在最前面）
    const fileIndex = await generateFileIndex(personaPath);

    // 2. 按优先级加载核心文件
    const parts: string[] = [fileIndex, "\n\n---\n\n"]; // 索引在前
    let fileCount = 0;

    // 优先加载核心文件
    for (const file of PRIORITY_FILES) {
      const filePath = join(personaPath, file);
      try {
        const content = await readFile(filePath, "utf-8");
        parts.push(content);
        fileCount++;
      } catch {
        // File doesn't exist, skip
      }
    }

    // 3. 动态加载其余md文件
    const allEntries = await readdir(personaPath, { withFileTypes: true, recursive: true });
    const loadedFiles = new Set(PRIORITY_FILES);

    for (const entry of allEntries) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      if (loadedFiles.has(entry.name)) continue;

      const filePath = join(personaPath, entry.name);
      try {
        const content = await readFile(filePath, "utf-8");
        parts.push(content);
        fileCount++;
      } catch {
        // Skip
      }
    }

    if (fileCount === 0) {
      return null;
    }

    return {
      systemPrompt: parts.join("\n\n"),
      files: fileCount,
      fileIndex,
    };
  } catch {
    return null;
  }
}
