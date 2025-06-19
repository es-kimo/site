import { getOssuLectureList } from "@/lib/github";

export default async function ArchivePage() {
  const lectures = await getOssuLectureList();

  console.log(lectures);

  return <div>Archive</div>;
}
