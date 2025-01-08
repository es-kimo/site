import fs from "fs";
import path from "path";

// TODO: 빌드 시점에만 실행되는지 테스트
const categoryPath = path.join(process.cwd(), "content");
const items = await fs.promises.readdir(categoryPath, { withFileTypes: true });
export const categories = items.filter((item) => item.isDirectory()).map((folder) => folder.name);
export const subCategories = new Map(
  categories.map((category) => {
    const subPath = path.join(categoryPath, category);
    const items = fs.readdirSync(subPath, { withFileTypes: true });
    return [category, items.filter((item) => item.isDirectory()).map((folder) => folder.name)];
  })
);

export const CATEGORIES = ["fe", "be", "algo", "cs"] as const;

export const SUB_CATEGORIES = {
  fe: ["react", "vue", "next.js"],
  be: ["spring"],
  algo: ["dp"],
  cs: ["computer architecture", "operating system"],
} as const;
