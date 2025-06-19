import { getLectureCourses } from "@/lib/github";
import { IndexList } from "@workspace/ui/templates/IndexList";
import { Link } from "next-view-transitions";

export default async function LecturePage({ params }: { params: { lectureName: string } }) {
  const courses = await getLectureCourses(params.lectureName);
  return (
    <IndexList>
      <IndexList.Header>{params.lectureName}</IndexList.Header>
      <IndexList.Grid>
        {courses.map(({ name, readmeContent }) => (
          <IndexList.Item
            key={name}
            Link={Link}
            item={name}
            href={`/ossu/archive/${params.lectureName}/${name}`}
            title={name}
            hashtags={readmeContent
              .split("\n")
              .slice(0, 1)
              .map((topic) => topic.trim())}
          />
        ))}
      </IndexList.Grid>
    </IndexList>
  );
}
