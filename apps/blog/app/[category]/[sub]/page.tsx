import { SubParams } from "@/constants/params.types";

export default async function Page({ params }: { params: Promise<SubParams> }) {
  const { category, sub } = await params;
  return (
    <ul className="flex flex-wrap flex-1 gap-0 md:gap-[2.7%]">
      hello world
      {/* {slugs?.map((slug) => <li key={slug}>{isCategory(category) && <NoteCard category={category} sub={sub} slug={slug} />}</li>)} */}
    </ul>
  );
}
