import { Metadata } from "next";

export type Category = string;

export type Notes = {
  [category: string]: {
    [sub: string]: string[];
  };
};

export type NoteMetadata = Partial<Metadata> & {
  other: {
    status: "ready" | "draft";
    createdAt: string;
    updatedAt?: string;
  };
};
