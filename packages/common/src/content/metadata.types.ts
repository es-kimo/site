import { Metadata } from "next";

export interface PostMetadata extends Metadata {
  other: {
    status: "ready" | "draft";
    createdAt: string;
    updatedAt?: string;
  };
  pinned?: boolean;
}
