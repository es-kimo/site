import { NavigationLink } from "@/components/navigation-link";
import { CATEGORIES } from "@/constants/notes";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@workspace/ui/components/navigation-menu";

export async function CategoryNavigationTab() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-4">
        <NavigationMenuItem>
          <NavigationLink href={`/writing`}>전체</NavigationLink>
        </NavigationMenuItem>
        {CATEGORIES.map((category) => (
          <NavigationMenuItem key={category}>
            <NavigationLink href={`/writing/${category}`} inclusiveActiveState>
              {category}
            </NavigationLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
