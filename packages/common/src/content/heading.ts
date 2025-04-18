/* eslint-disable @typescript-eslint/no-explicit-any */

// heading을 추출해서 custom data에 저장하는 remark plugin
import { visit } from "unist-util-visit";

export const remarkExtractHeadings = () => {
  return (tree: any, file: any) => {
    const headings: { value: string; depth: number; id: string }[] = [];

    visit(tree, "heading", (node: any) => {
      const text = node.children.map((c: any) => c.value).join("");
      const id = text.toLowerCase().replace(/\s+/g, "-");
      headings.push({ value: text, depth: node.depth, id });
    });

    file.data.headings = headings;
  };
};
