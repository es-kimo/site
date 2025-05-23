import { visit } from "unist-util-visit";

export const remarkExtractContent = () => {
  return (tree: any, file: any) => {
    const content: string[] = [];

    visit(tree, "paragraph", (node: any) => {
      const text = node.children.map((c: any) => c.value).join("");
      content.push(text);
    });

    file.data.content = content.join("\n");
  };
};
