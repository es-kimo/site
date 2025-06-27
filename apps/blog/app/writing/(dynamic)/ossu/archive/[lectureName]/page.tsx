import { getLectureCourses } from "@/lib/github";
import { IndexList } from "@workspace/ui/templates/IndexList";
import { Link } from "next-view-transitions";

export default async function LecturePage({ params }: { params: Promise<{ lectureName: string }> }) {
  const { lectureName } = await params;
  const courses = await getLectureCourses(lectureName);
  return (
    <IndexList>
      <IndexList.Header>{lectureName}</IndexList.Header>
      <IndexList.Grid>
        {courses.map(({ name, readmeContent }) => (
          <IndexList.Item
            key={name}
            Link={Link}
            item={name}
            href={`/writing/ossu/archive/${lectureName}/${name}`}
            title={name}
            hashtags={[readmeContent.substring(0, readmeContent.indexOf("\n")).trim()]}
          />
        ))}
      </IndexList.Grid>
    </IndexList>
  );
}
