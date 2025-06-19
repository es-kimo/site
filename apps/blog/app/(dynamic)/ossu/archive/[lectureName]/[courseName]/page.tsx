import { READMEViewer } from "@/components/READMEViewer";
import { getCourse } from "@/lib/github";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { Link } from "next-view-transitions";

export default async function CoursePage({ params }: { params: Promise<{ lectureName: string; courseName: string }> }) {
  const { lectureName, courseName } = await params;
  const course = await getCourse(lectureName, courseName);
  if (!course?.readmeContent) {
    return <div>Course not found</div>;
  }
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList className={`text-inherit font-semibold text-xs`}>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/ossu/archive`}>ossu</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/ossu/archive/${lectureName}`}>{lectureName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/ossu/archive/${lectureName}/${courseName}`}>{courseName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <READMEViewer content={course.readmeContent} />
    </div>
  );
}
