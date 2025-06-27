import { READMEViewer } from "@/components/READMEViewer";
import { getCourse } from "@/lib/github";

export default async function CoursePage({ params }: { params: Promise<{ lectureName: string; courseName: string }> }) {
  const { lectureName, courseName } = await params;
  const course = await getCourse(lectureName, courseName);
  if (!course?.readmeContent) {
    return <div>Course not found</div>;
  }
  return <READMEViewer content={course.readmeContent} />;
}
