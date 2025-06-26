import { useMDXComponents } from "@/mdx-components";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import rehypePrettyCode, { type Options } from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

interface READMEViewerProps {
  content: string;
}

const prettyCodeOptions: Options = {
  theme: {
    dark: "github-dark-high-contrast",
    light: "github-light-high-contrast",
  },
  keepBackground: false,
};

export function READMEViewer({ content }: READMEViewerProps) {
  const components = useMDXComponents({});
  return (
    <MDXRemote
      source={content}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
        },
      }}
    />
  );
}
