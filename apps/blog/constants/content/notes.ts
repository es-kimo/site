export const NOTES_CONFIG = {
  CONTENT_PATH: "content",
  FILE_NAME: "page.mdx",
  EXCLUDED_FOLDERS: ["img"],
  DEFAULT_SORT: "updatedAt" as const,
} as const;

export const NOTE_STATUS = {
  READY: "ready",
  DRAFT: "draft",
} as const;

export const CONTENT_STRUCTURE = {
  CATEGORY_LEVEL: 0,
  SUB_CATEGORY_LEVEL: 1,
  SLUG_LEVEL: 2,
} as const;

export type NoteStatus = (typeof NOTE_STATUS)[keyof typeof NOTE_STATUS];
export type ContentLevel = (typeof CONTENT_STRUCTURE)[keyof typeof CONTENT_STRUCTURE];
