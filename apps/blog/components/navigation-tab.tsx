import { NavigationLink } from "@/components/navigation-link";
import { getSubCategoriesByCategory } from "@/constants/notes";
import { t } from "@/locales/translate";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@workspace/ui/components/navigation-menu";

export default async function NavigationTab({ category }: { category: string }) {
  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-4">
        <NavigationMenuItem>
          <NavigationLink href={`/${category}`}>전체보기</NavigationLink>
        </NavigationMenuItem>
        {(await getSubCategoriesByCategory(category)).map((sub) => (
          <NavigationMenuItem key={category + sub}>
            <NavigationLink href={`/${category}/${sub}`}>{t(sub)}</NavigationLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
