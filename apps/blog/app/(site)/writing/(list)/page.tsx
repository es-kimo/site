import { NoteGrid } from "@/components/note-grid";
import { listNotes } from "@/constants/notes";

export default async function Page() {
  return <NoteGrid notes={await listNotes()} />;
}
