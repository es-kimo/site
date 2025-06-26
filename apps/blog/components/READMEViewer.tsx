import { useMDXComponents } from "@/mdx-components";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

interface READMEViewerProps {
  content: string;
}

export function READMEViewer({ content }: READMEViewerProps) {
  const components = useMDXComponents({});
  return (
    <MDXRemote
      source={content}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypePrettyCode],
        },
      }}
    />
  );
}
