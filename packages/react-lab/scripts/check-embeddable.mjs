/**
 * `embeddable: true`인 실험이 규약을 지키는지 검사한다.
 *
 * 규약: demo.tsx는 단일 파일이어야 하고 `react` 외의 import가 없어야 한다.
 * 블로그가 이 파일의 소스를 그대로 Sandpack에 넣는데, Sandpack은 자체 번들러로
 * 격리 실행되기 때문에 워크스페이스 모듈이나 CSS를 해석하지 못한다.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPERIMENTS = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "experiments");
const ALLOWED = new Set(["react"]);
const IMPORT = /\bimport\b[^;\n]*?\bfrom\s*["']([^"']+)["']|\bimport\s*["']([^"']+)["']/g;

const problems = [];
let checked = 0;

const entries = await readdir(EXPERIMENTS, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const meta = await readFile(path.join(EXPERIMENTS, entry.name, "meta.ts"), "utf8").catch(() => null);
  if (meta === null) {
    problems.push(`${entry.name}: meta.ts가 없습니다`);
    continue;
  }

  const demo = await readFile(path.join(EXPERIMENTS, entry.name, "demo.tsx"), "utf8").catch(() => null);
  if (demo === null) {
    problems.push(`${entry.name}: demo.tsx가 없습니다`);
    continue;
  }

  if (!/embeddable:\s*true/.test(meta)) continue;
  checked += 1;

  for (const match of demo.matchAll(IMPORT)) {
    const specifier = match[1] ?? match[2];
    if (!ALLOWED.has(specifier)) {
      problems.push(`${entry.name}: embeddable 실험인데 "${specifier}"를 import합니다 (허용: ${[...ALLOWED].join(", ")})`);
    }
  }
}

if (problems.length > 0) {
  console.error("embeddable 규약 위반:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`embeddable 실험 ${checked}개, 규약 위반 없음`);
