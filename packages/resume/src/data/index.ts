import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import type { ResumeData } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESUME_PATH = resolve(__dirname, "../../resume.yaml");

let cached: ResumeData | null = null;

/**
 * resume.yaml 를 파싱하여 ResumeData 객체를 반환합니다.
 * 한 번 읽으면 캐싱되며, `force` 옵션으로 캐시를 무시할 수 있습니다.
 */
export function getResumeData(options?: { force?: boolean }): ResumeData {
  if (cached && !options?.force) return cached;

  const raw = readFileSync(RESUME_PATH, "utf-8");
  const data = parse(raw) as ResumeData;
  cached = data;
  return data;
}

export { type ResumeData };
