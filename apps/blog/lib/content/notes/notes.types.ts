import { BaseMetadata } from "../../core/metadata";

export interface NoteMetadata extends BaseMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  other: {
    status: "ready" | "draft";
    createdAt: string;
    updatedAt?: string;
  };
  pinned?: boolean;
}

export interface NoteStructure {
  [category: string]: {
    [subCategory: string]: string[];
  };
}

export interface NoteItem {
  category: string;
  subCategory: string;
  slug: string;
  metadata: NoteMetadata;
  filePath: string;
}
