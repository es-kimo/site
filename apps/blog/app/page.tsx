import { NoteGrid } from "@/components/note-grid";
import { NOTES, sortNotesByLatestDate } from "@/constants/notes";

const RECENT_COUNT = 5;

async function getRecentNotes() {
  const all = Object.entries(NOTES).flatMap(([category, slugs]) => slugs.map((slug) => ({ category, slug })));
  const sortedNotes = await sortNotesByLatestDate(all);

  return sortedNotes.slice(0, RECENT_COUNT);
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
