import { validateAnniversarySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AnniversaryContent from "@/components/AnniversaryContent";

export default async function AnniversaryPage() {
  const isValid = await validateAnniversarySession();

  if (!isValid) {
    redirect("/not-found");
  }

  return (
    <main className="min-h-screen pb-24">
      <AnniversaryContent />
    </main>
  );
}
