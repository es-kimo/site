import { getInterviewStories } from "@workspace/resume/data";
import type { Metadata } from "next";
import Link from "next/link";
import { InterviewStoriesViewer } from "./interview-stories-viewer";

export const metadata: Metadata = {
  title: "Interview Stories",
  robots: { index: false, follow: false },
};

export default function InterviewStoriesPage() {
  const { stories } = getInterviewStories();
  return (
    <>
      <Link href="/vault/f7e2a1d9/feedback" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        Interview Feedback →
      </Link>
      <InterviewStoriesViewer stories={stories} />
    </>
  );
}
