import { NoteGrid } from "@/components/note-grid";
import { NOTES } from "@/constants/notes";

export default function Page() {
  const notes = Object.entries(NOTES).flatMap(([category, subCategories]) => Object.entries(subCategories).flatMap(([sub, slugs]) => slugs.map((slug) => ({ category, sub, slug }))));

  return <NoteGrid notes={notes} />;
}
