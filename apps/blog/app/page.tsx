import { NoteGrid } from "@/components/note-grid";
import { getSlugMetadata, NOTES } from "@/constants/notes";

const RECENT_COUNT = 5;

async function getRecentNotes() {
  const all = Object.entries(NOTES).flatMap(([category, slugs]) => slugs.map((slug) => ({ category, slug })));

  const withDates = await Promise.all(
    all.map(async ({ category, slug }) => {
      const metadata = await getSlugMetadata(category, slug);
      const date = metadata.other?.updatedAt ?? metadata.other?.createdAt ?? "1970-01-01";
      return { category, slug, date };
    }),
  );

  withDates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return withDates.slice(0, RECENT_COUNT);
}

export default async function HomePage() {
  const recentNotes = await getRecentNotes();

  return (
    <div>
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Recent</h2>
        <NoteGrid notes={recentNotes} />
      </section>
    </div>
  );
}
