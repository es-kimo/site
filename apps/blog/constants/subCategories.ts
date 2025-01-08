import { Category } from "@/constants/categories.types";
import fs from "fs";
import path from "path";

const ENTRY = path.join(process.cwd(), "content");

export const getSubCategoriesByCategory = (category: Category) => {
  const subPath = path.join(ENTRY, category);
  const items = fs.readdirSync(subPath, { withFileTypes: true });
  return items.filter((item) => item.isDirectory()).map((folder) => folder.name);
};
