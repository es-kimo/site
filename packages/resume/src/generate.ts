// =============================================================================
// resume.yaml → 여러 포맷으로 산출물을 생성하는 CLI 스크립트
// 사용: pnpm --filter @workspace/resume generate
// =============================================================================

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { getResumeData } from "./data/index.js";
import { toMarkdown } from "./generators/markdown.js";
import { toJsonLd } from "./generators/json-ld.js";
import { toJsonResume } from "./generators/json-resume.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../dist");

function main() {
  const data = getResumeData({ force: true });

  mkdirSync(OUT_DIR, { recursive: true });

  // 1. Markdown — LLM 컨텍스트, llms.txt, GitHub 프로필 등
  const md = toMarkdown(data);
  writeFileSync(resolve(OUT_DIR, "resume.md"), md, "utf-8");
  console.log("✓ dist/resume.md");

  // 2. JSON Resume 표준 포맷
  const jsonResume = toJsonResume(data);
  writeFileSync(resolve(OUT_DIR, "resume.json"), JSON.stringify(jsonResume, null, 2) + "\n", "utf-8");
  console.log("✓ dist/resume.json");

  // 3. JSON-LD (Schema.org)
  const jsonLd = toJsonLd(data);
  writeFileSync(resolve(OUT_DIR, "resume.jsonld"), JSON.stringify(jsonLd, null, 2) + "\n", "utf-8");
  console.log("✓ dist/resume.jsonld");

  console.log("\nDone! Generated files in packages/resume/dist/");
}

main();
