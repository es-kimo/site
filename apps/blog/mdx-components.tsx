import { formatPostDate } from "@/lib/date";
import type { MDXComponents } from "mdx/types";
import Image, { ImageProps } from "next/image";

// 헤딩 텍스트를 id로 변환하는 함수
function generateId(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[()]/g, "") // 괄호 제거
    .replace(/\s+/g, "-") // 공백을 하이픈으로
    .replace(/[^\w\u3131-\uD79D-]/g, "") // 영문, 숫자, 한글, 하이픈만 유지
    .replace(/--+/g, "-") // 연속된 하이픈을 하나로
    .replace(/^-+/, "") // 시작 하이픈 제거
    .replace(/-+$/, ""); // 끝 하이픈 제거
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1 className="scroll-m-20 text-3xl font-bold tracking-tight animate-fadein" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children }) => {
      const id = typeof children === "string" ? generateId(children) : "";
      return (
        <h2 id={id} className="mt-10 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = typeof children === "string" ? generateId(children) : "";
      return (
        <h3 id={id} className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight">
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const id = typeof children === "string" ? generateId(children) : "";
      return (
        <h4 id={id} className="mt-8 scroll-m-20 text-lg font-semibold tracking-tight">
          {children}
        </h4>
      );
    },
    p: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>,
    blockquote: ({ children }) => <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>,
    table: ({ children }) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">{children}</table>
      </div>
    ),
    tbody(properties) {
      return <tbody {...properties}></tbody>;
    },
    thead(properties) {
      return <thead {...properties}></thead>;
    },
    tr(properties) {
      return <tr {...properties} className="m-0 border-t p-0 even:bg-muted"></tr>;
    },
    th(properties) {
      return <th {...properties} className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"></th>;
    },
    td(properties) {
      return <td {...properties} className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"></td>;
    },
    ul(properties) {
      return <ul {...properties} className="my-4 ml-6 list-disc [&>li]:mt-2"></ul>;
    },
    ol(properties) {
      return <ol {...properties} className="my-4 ml-6 list-decimal [&>li]:mt-2"></ol>;
    },
    li(properties) {
      return <li {...properties}></li>;
    },
    code(properties) {
      return (
        <code
          {...properties}
          className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold [pre_&]:bg-[var(--code-block-bg)] [pre_&]:p-0 [pre_&]:rounded-none [pre_&]:font-normal [pre_&]:text-[13px] [pre_&]:border-[var(--code-block-border)]"
        ></code>
      );
    },
    pre(properties) {
      return <pre {...properties} className="border border-[var(--code-block-border)] rounded-[10px] p-4 bg-[var(--code-block-bg)] mt-6 overflow-x-auto"></pre>;
    },
    Image: (props) => <Image {...(props as ImageProps)} className="w-4/5 mx-auto my-6" />,
    Lead(properties) {
      return <p {...properties} className="text-xl text-muted-foreground"></p>;
    },
    Large(properties) {
      return <div {...properties} className="text-lg font-semibold"></div>;
    },
    Small(properties) {
      return <small {...properties} className="text-sm font-medium leading-none"></small>;
    },
    Muted(properties) {
      return <p {...properties} className="text-sm text-muted-foreground"></p>;
    },
    Callout({ children, ...properties }) {
      return (
        <div {...properties} className="mt-6 rounded p-4 bg-muted flex">
          <span className="mr-3">💡</span>
          {children}
        </div>
      );
    },
    PostDate({ children, ...properties }) {
      return (
        <div {...properties} className="text-muted-foreground pt-2 text-xs lg:hidden">
          작성일: {formatPostDate(children)}
        </div>
      );
    },
    TOC({ items, ...properties }) {
      return (
        <nav {...properties} className="my-8 rounded-lg border bg-muted/50 p-6">
          <h2 className="text-lg font-semibold mb-4 mt-0 border-b-0 pb-0">목차</h2>
          <ol className="my-0 ml-0 list-none space-y-2">
            {items.map((item: { title: string }, index: number) => {
              const id = generateId(item.title);
              return (
                <li key={id} className="mt-0">
                  <a href={`#${id}`} className="text-sm text-foreground hover:text-primary transition-colors inline-flex items-start group">
                    <span className="text-muted-foreground mr-2 min-w-[1.5rem]">{index + 1}.</span>
                    <span className="group-hover:underline">{item.title}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      );
    },
    ...components,
  };
}
