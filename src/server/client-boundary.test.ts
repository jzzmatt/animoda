import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const roots = ["src/components", "src/studio", "src/content", "app"].map((dir) => path.join(process.cwd(), dir));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      if (full.includes(`${path.sep}api${path.sep}`) || full.endsWith(`${path.sep}api`)) return [];
      return sourceFiles(full);
    }
    return /\.(tsx|ts|js|jsx|css)$/.test(name) ? [full] : [];
  });
}

describe("client boundary", () => {
  it("keeps the OpenAI credential and SDK out of browser code", () => {
    const files = roots.flatMap((root) => sourceFiles(root));
    const hits = files.flatMap((file) => {
      const text = readFileSync(file, "utf8");
      const problems = ["OPENAI_API_KEY", "OPENAI_IMAGE_MODEL", "process.env.OPENAI", 'from "openai"', "from 'openai'", "sk-"].filter((needle) =>
        text.includes(needle),
      );
      return problems.length > 0 ? [`${path.relative(process.cwd(), file)}: ${problems.join(", ")}`] : [];
    });
    expect(hits).toEqual([]);
  });
});
