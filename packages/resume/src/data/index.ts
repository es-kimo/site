import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import type { ResumeData } from "../types.js";
import type { InterviewStoriesData } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESUME_PATH = resolve(__dirname, "../../resume.yaml");
const INTERVIEW_STORIES_PATH = resolve(__dirname, "../../interview-stories.yaml");

let cached: ResumeData | null = null;
let cachedStories: InterviewStoriesData | null = null;

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

export function getInterviewStories(options?: { force?: boolean }): InterviewStoriesData {
  if (cachedStories && !options?.force) return cachedStories;

  const raw = readFileSync(INTERVIEW_STORIES_PATH, "utf-8");
  const data = parse(raw) as InterviewStoriesData;
  cachedStories = data;
  return data;
}

export { type ResumeData, type InterviewStoriesData };
