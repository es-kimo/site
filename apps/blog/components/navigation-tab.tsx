import { NavigationLink } from "@/components/navigation-link";
import { ALL_NOTES, CATEGORIES, NOTES } from "@/constants/notes";
import { formatCategoryLabel } from "@/lib/category";

export function CategoryNavigationTab() {
  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
      <NavigationLink href="/writing" count={ALL_NOTES.length}>
        전체
      </NavigationLink>
      {CATEGORIES.map((category) => (
        <NavigationLink key={category} href={`/writing/${category}`} count={NOTES[category]?.length ?? 0}>
          {formatCategoryLabel(category)}
        </NavigationLink>
      ))}
    </nav>
  );
}
