import fs from "fs";
import path from "path";
import { compile } from "@mdx-js/mdx";
import { remarkExtractHeadings } from "@workspace/common/content/heading";
import { categories, subCategoriesMap } from "@workspace/common/structure/structure";
import { getSlugsByCategoryAndSubCategory } from "@workspace/common/structure/utils";
import type { NavigationData, CategoryData, SubCategoryData, Heading } from "./navigation-data.types";

async function getMdxHeadings({ category, subCategory }: { category: string; subCategory: string }): Promise<Heading[]> {
  const filePath = path.join(process.cwd(), "content", category, subCategory, "page.mdx");

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const source = fs.readFileSync(filePath, "utf-8");

  const compiled = await compile(source, {
    outputFormat: "function-body",
    remarkPlugins: [remarkExtractHeadings],
  });

  return (compiled.data.headings as Heading[]) || [];
}

async function generateNavigationData(): Promise<void> {
  console.log("🔄 Generating navigation data...");

  const navigationData: NavigationData = {
    categories: [],
  };

  for (const category of categories) {
    const categoryData: CategoryData = {
      category,
      subCategories: [],
    };

    const subCategories = subCategoriesMap.get(category) ?? [];

    for (const subCategory of subCategories) {
      const slugs = await getSlugsByCategoryAndSubCategory(category, subCategory);
      const hasSlug = slugs && slugs.length > 0;

      let headings: Heading[] | null = null;

      if (!hasSlug) {
        const allHeadings = await getMdxHeadings({ category, subCategory });
        headings = allHeadings.filter((heading) => heading.depth === 2);
      }

      const subCategoryData: SubCategoryData = {
        subCategory,
        hasSlug,
        headings,
      };

      categoryData.subCategories.push(subCategoryData);
    }

    navigationData.categories.push(categoryData);
  }

  const outputPath = path.join(process.cwd(), "lib", "navigation-data.json");
  fs.writeFileSync(outputPath, JSON.stringify(navigationData, null, 2), "utf-8");

  console.log("✅ Navigation data generated successfully at:", outputPath);
  console.log(`📊 Generated data for ${navigationData.categories.length} categories`);
}

generateNavigationData().catch((error) => {
  console.error("❌ Error generating navigation data:", error);
  process.exit(1);
});
