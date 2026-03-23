import { getInterviewStories } from "@workspace/resume/data";
import type { Metadata } from "next";
import { InterviewStoriesViewer } from "./interview-stories-viewer";

export const metadata: Metadata = {
  title: "Interview Stories",
  robots: { index: false, follow: false },
};

export default function InterviewStoriesPage() {
  const { stories } = getInterviewStories();
  return <InterviewStoriesViewer stories={stories} />;
}
