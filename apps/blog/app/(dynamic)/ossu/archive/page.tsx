import { getOssuLectureList, getLectureTopics } from "@/lib/github";
import { zip } from "@workspace/common/lib/array-utils";
import { IndexList } from "@workspace/ui/templates/IndexList";
import { Link } from "next-view-transitions";

export default async function ArchivePage() {
  const lectures = await getOssuLectureList();
  const topics = await Promise.all(
    lectures.map((lecture) => {
      return getLectureTopics(lecture);
    })
  );
  return (
    <IndexList>
      <IndexList.Header>OSSU Archive</IndexList.Header>
      <IndexList.Grid>
        {zip(lectures, topics).map(([lecture, topics]) => (
          <IndexList.Item key={lecture} Link={Link} item={lecture} href={`/ossu/archive/${lecture}`} title={lecture} hashtags={topics} />
        ))}
      </IndexList.Grid>
    </IndexList>
  );
}
