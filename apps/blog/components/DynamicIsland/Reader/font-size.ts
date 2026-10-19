import { FONT_SIZES } from "./constants";

const STORAGE_KEY = "reader-font-size";

/** 저장해 둔 글자 크기 단계. 없거나 범위를 벗어나면 null */
export function readSavedSizeIndex(): number | null {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    // iframe(/preview)에서는 브라우저 설정에 따라 저장소 접근이 막힌다. 기본 크기를 쓴다.
  }
  if (saved === null) return null;
  const index = Number.parseInt(saved, 10);
  return index >= 0 && index < FONT_SIZES.length ? index : null;
}

export function saveSizeIndex(index: number) {
  localStorage.setItem(STORAGE_KEY, index.toString());
}

/** 글 본문(`ArticleFrame`)이 읽는 글자 크기 변수를 정한다 */
export function applyArticleFontSize(index: number) {
  const size = FONT_SIZES[index];
  document.documentElement.style.setProperty("--article-font-size", `${size?.value}px`);
  document.documentElement.style.setProperty("--article-scale", `${size?.scale}`);
  document.documentElement.style.setProperty("--article-line-height", `${size?.lineHeight}`);
}
