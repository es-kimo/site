import { subCategories } from "@/constants/categories";
import { Category } from "@/constants/categories.types";
import { t } from "@/locales/translate";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@workspace/ui/components/navigation-menu";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import path from "path";

export const restyledNavigationMenuTriggerStyle = () => cn(navigationMenuTriggerStyle(), "text-base text-neutral-400 hover:bg-inherit transition-colors duration-300");

export default async function NavigationTab({ category }: { category: Category }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href={"/" + category} legacyBehavior passHref>
            <NavigationMenuLink className={restyledNavigationMenuTriggerStyle()}>전체보기</NavigationMenuLink>
          </Link>
          {subCategories.get(category)?.map((sub) => (
            <Link key={sub} href={"/" + path.join(category, sub)} legacyBehavior passHref>
              <NavigationMenuLink className={restyledNavigationMenuTriggerStyle()}>{t(sub)}</NavigationMenuLink>
            </Link>
          ))}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
