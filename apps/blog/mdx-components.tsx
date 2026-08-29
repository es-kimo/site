import { EmbedIframe } from "@/components/EmbedIframe";
import { Mermaid } from "@/components/Mermaid";
import { Playground } from "@/components/Playground";
import { SeriesNav } from "@/components/SeriesNav";
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
      <h1 className="mb-2 mt-6 scroll-m-20 text-xl font-semibold tracking-tight animate-fadein text-foreground/95 first:mt-0" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children }) => {
      const id = typeof children === "string" ? generateId(children) : "";
      return (
        <h2 id={id} className="mb-2 mt-6 scroll-m-20 text-lg font-semibold tracking-tight first:mt-0 text-foreground/95">
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = typeof children === "string" ? generateId(children) : "";
      return (
        <h3 id={id} className="mb-1 mt-3 scroll-m-20 text-base font-medium tracking-tight text-foreground/95">
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const id = typeof children === "string" ? generateId(children) : "";
      return (
        <h4 id={id} className="mb-1 mt-3 scroll-m-20 text-sm font-medium tracking-tight text-foreground/90">
          {children}
        </h4>
      );
    },
    p: ({ children }) => <p className="leading-relaxed">{children}</p>,
    a: ({ children, href, ...props }) => {
      const shouldOpenInNewTab = typeof href === "string" && href.startsWith("/embeds/");
      const target = props.target ?? (shouldOpenInNewTab ? "_blank" : undefined);
      const rel = target === "_blank" ? (props.rel ?? "noopener noreferrer") : props.rel;

      return (
        <a
          href={href}
          {...props}
          target={target}
          rel={rel}
          className="text-[var(--markdown-link)] hover:text-[var(--markdown-link-hover)] underline decoration-current/25 hover:decoration-current/55 underline-offset-2 transition-colors duration-200"
        >
          {children}
        </a>
      );
    },
    blockquote: ({ children }) => <blockquote className="my-1 border-l-2 border-[var(--markdown-link)]/60 py-1 pl-3 text-foreground/75 [&>p]:my-0">{children}</blockquote>,
    table: ({ children }) => (
      <div className="my-2 w-full overflow-x-auto rounded-md border border-[var(--markdown-soft-border)]">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    tbody(properties) {
      return <tbody {...properties}></tbody>;
    },
    thead(properties) {
      return <thead {...properties} className="bg-[var(--markdown-soft-surface)]"></thead>;
    },
    tr(properties) {
      return <tr {...properties} className="m-0 border-t border-[var(--markdown-soft-border)] p-0 first:border-t-0 even:bg-[var(--markdown-soft-surface)]"></tr>;
    },
    th(properties) {
      return <th {...properties} className="border-r border-[var(--markdown-soft-border)] px-2.5 py-1.5 text-left font-semibold text-foreground/85 last:border-r-0 [&[align=center]]:text-center [&[align=right]]:text-right"></th>;
    },
    td(properties) {
      return <td {...properties} className="border-r border-[var(--markdown-soft-border)] px-2.5 py-1.5 text-left text-foreground/80 last:border-r-0 [&[align=center]]:text-center [&[align=right]]:text-right"></td>;
    },
    ul(properties) {
      return <ul {...properties} className={`${properties.className ?? ""} my-2 list-disc pl-4 [&_ul]:pl-6 [&_ol]:pl-6 [&>li]:my-1 [&.contains-task-list]:list-none [&.contains-task-list]:pl-0`}></ul>;
    },
    ol(properties) {
      return <ol {...properties} className={`${properties.className ?? ""} my-2 list-decimal pl-4 [&_ul]:pl-6 [&_ol]:pl-6 [&>li]:my-1 [&.contains-task-list]:list-none [&.contains-task-list]:pl-0`}></ol>;
    },
    li(properties) {
      return <li {...properties} className={`${properties.className ?? ""} pl-1 text-foreground/90 marker:text-muted-foreground [&.task-list-item]:list-none [&.task-list-item]:pl-0`}></li>;
    },
    input(properties) {
      return <input {...properties} className={`${properties.className ?? ""} mr-2 size-3.5 align-[-1px] accent-[var(--markdown-link)]`} />;
    },
    details(properties) {
      return <details {...properties} className={`${properties.className ?? ""} my-2 rounded-md border border-[var(--markdown-soft-border)] bg-[var(--markdown-soft-surface)] px-3 py-2 open:pb-3`}></details>;
    },
    summary(properties) {
      return <summary {...properties} className={`${properties.className ?? ""} cursor-pointer select-none font-medium text-foreground/85 marker:text-muted-foreground`}></summary>;
    },
    code(properties) {
      return (
        <code
          {...properties}
          className="break-words rounded bg-[var(--inline-code-background)] px-1 py-0.5 font-mono text-[0.9em] font-normal text-[var(--inline-code-foreground)] [pre_&]:break-normal [pre_&]:bg-[var(--code-block-bg)] [pre_&]:p-0 [pre_&]:rounded-none [pre_&]:font-normal [pre_&]:text-[13px] [pre_&]:text-foreground/90 [pre_&]:border-[var(--code-block-border)]"
        ></code>
      );
    },
    pre(properties) {
      return <pre {...properties} className="my-2 overflow-x-auto rounded-lg border border-[var(--code-block-border)] bg-[var(--code-block-bg)] p-4 leading-relaxed shadow-sm"></pre>;
    },
    hr(properties) {
      return <hr {...properties} className="my-4 border-t border-[var(--markdown-soft-border)]" />;
    },
    Image: (props) => <Image {...(props as ImageProps)} className="mx-auto my-3 h-auto max-w-full rounded-md border border-[var(--markdown-soft-border)]" />,
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
        <div {...properties} className="my-3 flex gap-2.5 rounded-md border-l-2 border-[var(--markdown-link)]/60 bg-[var(--markdown-soft-surface)] px-3 py-2.5">
          <span className="text-base">💡</span>
          <div className="flex-1 text-foreground/85">{children}</div>
        </div>
      );
    },
    AIAssisted(properties) {
      return (
        <div {...properties} className="mt-6 mb-8 rounded-lg px-4 py-3 bg-muted/40 border border-border/50 text-sm text-muted-foreground flex items-start gap-2">
          <span className="shrink-0">🤖</span>
          <span>이 글의 주제와 흐름은 작성자의 생각이며, 본문 작성에 AI의 도움을 받았습니다.</span>
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
        <nav {...properties} style={{ fontSize: "14px", lineHeight: "1.5" }} className="my-3 rounded-md border border-[var(--markdown-soft-border)] bg-[var(--markdown-soft-surface)] p-4">
          <h2 style={{ fontSize: "16px", lineHeight: "1.4" }} className="mb-3 mt-0 border-b-0 pb-0 font-medium">
            목차
          </h2>
          <ol className="my-0 ml-0 list-none space-y-2">
            {items.map((item: { title: string }, index: number) => {
              const id = generateId(item.title);
              return (
                <li key={id} className="mt-0">
                  <a href={`#${id}`} style={{ fontSize: "14px", lineHeight: "1.5" }} className="group inline-flex items-start text-foreground/80 transition-colors hover:text-[var(--markdown-link)]">
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
    Footnote({ id, children, ...properties }) {
      return (
        <sup {...properties} id={`fnref-${id}`}>
          <a href={`#fn-${id}`} className="text-primary hover:underline">
            [{children || id}]
          </a>
        </sup>
      );
    },
    FootnoteRef({ ids, children, ...properties }) {
      // ids가 배열이면 그대로 사용, 아니면 배열로 변환
      const idArray = Array.isArray(ids) ? ids : [ids];
      return (
        <div {...properties} className="text-sm leading-relaxed my-4">
          {/* 모든 id에 대한 숨겨진 앵커 포인트 생성 */}
          {idArray.map((id) => (
            <span key={id} id={`fn-${id}`} className="absolute opacity-0 pointer-events-none" />
          ))}

          {/* 번호 표시 (왼쪽 정렬) */}
          <div className="font-mono text-muted-foreground text-xs mb-1">{idArray.map((id) => `[${id}]`)}</div>

          {/* 내용 (들여쓰기) */}
          <div className="pl-4 border-l-2 border-muted/60 break-words text-foreground/80">{children} </div>
        </div>
      );
    },
    EmbedIframe,
    Playground,
    Mermaid,
    SeriesNav,
    ...components,
  };
}
