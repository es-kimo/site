import fs from "fs";
import path from "path";
import { remarkExtractHeadings } from "@workspace/common/content/heading";
import { compile } from "@mdx-js/mdx";

export type Heading = {
  value: string;
  depth: number;
  id: string;
};

export async function getMdxContent({ category, subCategory, slug }: { category: string; subCategory?: string; slug?: string }) {
  let filePath = "";

  if (subCategory === undefined) {
    if (slug) {
      filePath = path.join("content", `${category}/${slug}.mdx`);
    }
    throw new Error("subCategory와 slug 중 하나는 명시해야합니다.");
  } else {
    filePath = path.join("content", category, subCategory, "page.mdx");
  }

  const source = fs.readFileSync(filePath, "utf-8");

  const compiled = await compile(source, {
    outputFormat: "function-body",
    remarkPlugins: [remarkExtractHeadings],
  });

  return {
    code: String(compiled),
    headings: compiled.data.headings as Heading[],
  };
}
