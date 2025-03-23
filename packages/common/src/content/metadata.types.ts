import { Metadata } from "next";

export type PostMetadata = Partial<Metadata> & {
  other: {
    status: "ready" | "draft";
    createdAt: string;
    updatedAt?: string;
  };
};
