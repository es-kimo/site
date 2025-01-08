import type { Metadata } from "next";

export type NoteMetadata = Partial<Metadata> & {
  other: {
    status: "ready" | "draft";
    createdAt: string;
    updatedAt?: string;
  };
};
