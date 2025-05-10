import fs from "fs";
import path from "path";
import { remarkExtractHeadings } from "@workspace/common/content/heading";
import { remarkExtractContent } from "@workspace/common/content/content";
import { compile } from "@mdx-js/mdx";

export type Heading = {
  value: string;
  depth: number;
  id: string;
};

export async function getMdxContent({ category, subCategory, slug }: { category: string; subCategory: string; slug?: string }) {
  let filePath = "";

  if (slug) {
    filePath = path.join("content", category, subCategory, slug, "page.mdx");
  } else {
    filePath = path.join("content", category, subCategory, "page.mdx");
  }

  const source = fs.readFileSync(filePath, "utf-8");

  const compiled = await compile(source, {
    outputFormat: "function-body",
    remarkPlugins: [remarkExtractHeadings, remarkExtractContent],
  });

  return {
    code: String(compiled),
    headings: compiled.data.headings as Heading[],
    content: compiled.data.content as string,
  };
}
