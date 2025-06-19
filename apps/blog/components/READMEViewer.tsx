import { useMDXComponents } from "@/mdx-components";
import { MDXRemote } from "next-mdx-remote-client/rsc";

interface READMEViewerProps {
  content: string;
}

export function READMEViewer({ content }: READMEViewerProps) {
  const components = useMDXComponents({});
  return <MDXRemote source={content} components={components} />;
}
