import { NavigationLink } from "@/components/navigation-link";
import { CATEGORIES, getSubCategoriesByCategory } from "@/constants/notes";
import { t } from "@/locales/translate";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@workspace/ui/components/navigation-menu";

export async function SubCategoryNavigationTab({ category }: { category: string }) {
  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-4">
        <NavigationMenuItem>
          <NavigationLink href={`/writing/${category}`}>전체</NavigationLink>
        </NavigationMenuItem>
        {(await getSubCategoriesByCategory(category)).map((sub) => (
          <NavigationMenuItem key={category + sub}>
            <NavigationLink href={`/writing/${category}/${sub}`}>{t(sub)}</NavigationLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export async function CategoryNavigationTab() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-4">
        <NavigationMenuItem>
          <NavigationLink href={`/`}>전체</NavigationLink>
        </NavigationMenuItem>
        {CATEGORIES.map((category) => (
          <NavigationMenuItem key={category}>
            <NavigationLink href={`/writing/${category}`} inclusiveActiveState>
              {t(category)}
            </NavigationLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
