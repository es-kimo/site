import { EmbedIframe } from "@/components/EmbedIframe";
import { Mermaid } from "@/components/Mermaid";
import { Playground } from "@/components/Playground";
import { SeriesNav } from "@/components/SeriesNav";
import { formatPostDate } from "@/lib/date";
import { Lightbulb } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import Image, { ImageProps } from "next/image";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1
        className="mb-2 mt-6 scroll-m-20 text-xl font-semibold tracking-tight animate-fadein text-foreground/95 first:mt-0"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        {...props}
        className="mb-2 mt-6 scroll-m-20 text-lg font-semibold tracking-tight first:mt-0 text-foreground/95"
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 {...props} className="mb-1 mt-3 scroll-m-20 text-base font-medium tracking-tight text-foreground/95">
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 {...props} className="mb-1 mt-3 scroll-m-20 text-sm font-medium tracking-tight text-foreground/90">
        {children}
      </h4>
    ),
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
    blockquote: ({ children }) => (
      <blockquote className="my-1 border-l-2 border-[var(--markdown-link)]/60 py-1 pl-3 text-foreground/75 [&>p]:my-0">
        {children}
      </blockquote>
    ),
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
      return (
        <tr
          {...properties}
          className="m-0 border-t border-[var(--markdown-soft-border)] p-0 first:border-t-0 even:bg-[var(--markdown-soft-surface)]"
        ></tr>
      );
    },
    th(properties) {
      return (
        <th
          {...properties}
          className="border-r border-[var(--markdown-soft-border)] px-2.5 py-1.5 text-left font-semibold text-foreground/85 last:border-r-0 [&[align=center]]:text-center [&[align=right]]:text-right"
        ></th>
      );
    },
    td(properties) {
      return (
        <td
          {...properties}
          className="border-r border-[var(--markdown-soft-border)] px-2.5 py-1.5 text-left text-foreground/80 last:border-r-0 [&[align=center]]:text-center [&[align=right]]:text-right"
        ></td>
      );
    },
    ul(properties) {
      return (
        <ul
          {...properties}
          className={`${properties.className ?? ""} my-2 list-disc pl-4 [&_ul]:pl-6 [&_ol]:pl-6 [&>li]:my-1 [&.contains-task-list]:list-none [&.contains-task-list]:pl-0`}
        ></ul>
      );
    },
    ol(properties) {
      return (
        <ol
          {...properties}
          className={`${properties.className ?? ""} my-2 list-decimal pl-4 [&_ul]:pl-6 [&_ol]:pl-6 [&>li]:my-1 [&.contains-task-list]:list-none [&.contains-task-list]:pl-0`}
        ></ol>
      );
    },
    li(properties) {
      return (
        <li
          {...properties}
          className={`${properties.className ?? ""} pl-1 text-foreground/90 marker:text-muted-foreground [&.task-list-item]:list-none [&.task-list-item]:pl-0`}
        ></li>
      );
    },
    input(properties) {
      return (
        <input
          {...properties}
          className={`${properties.className ?? ""} mr-2 size-3.5 align-[-1px] accent-[var(--markdown-link)]`}
        />
      );
    },
    details(properties) {
      return (
        <details
          {...properties}
          className={`${properties.className ?? ""} my-2 rounded-md border border-[var(--markdown-soft-border)] bg-[var(--markdown-soft-surface)] px-3 py-2 open:pb-3`}
        ></details>
      );
    },
    summary(properties) {
      return (
        <summary
          {...properties}
          className={`${properties.className ?? ""} cursor-pointer select-none font-medium text-foreground/85 marker:text-muted-foreground`}
        ></summary>
      );
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
      return (
        <pre
          {...properties}
          className="my-2 overflow-x-auto rounded-lg border border-[var(--code-block-border)] bg-[var(--code-block-bg)] p-4 leading-relaxed shadow-sm"
        ></pre>
      );
    },
    hr(properties) {
      return <hr {...properties} className="my-4 border-t border-[var(--markdown-soft-border)]" />;
    },
    Image: (props) => (
      <Image
        {...(props as ImageProps)}
        className="mx-auto my-3 h-auto max-w-full rounded-md border border-[var(--markdown-soft-border)]"
      />
    ),
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
        <aside
          {...properties}
          className="my-4 overflow-hidden rounded-lg border border-[var(--markdown-soft-border)] bg-[var(--markdown-panel-background)] shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-[var(--markdown-soft-border)] px-3 py-2">
            <Lightbulb aria-hidden="true" className="size-3.5 text-[var(--inline-code-foreground)]" strokeWidth={1.8} />
            <span className="text-xs font-medium text-foreground/70">잠깐 짚고 가기</span>
          </div>
          <div className="px-3 py-2.5 text-foreground/80 [&>p]:m-0">{children}</div>
        </aside>
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
        <nav {...properties} aria-label="목차" className="my-5 border-y border-[var(--markdown-soft-border)] py-3">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="text-xs font-semibold text-muted-foreground">목차</span>
          </div>
          <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
            {items.map((item: { title: string; id: string }, index: number) => {
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="group grid grid-cols-[1.75rem_1fr] items-baseline text-sm text-foreground/75 no-underline transition-colors hover:text-foreground"
                  >
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-6 underline-offset-2 group-hover:underline">{item.title}</span>
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
        <sup {...properties} id={`fnref-${id}`} className="ml-0.5 scroll-mt-20 align-super text-[0.7em] leading-none">
          <a
            href={`#fn-${id}`}
            aria-label={`각주 ${children || id}`}
            className="tabular-nums text-[var(--markdown-link)] no-underline underline-offset-2 hover:underline"
          >
            {children || id}
          </a>
        </sup>
      );
    },
    FootnoteRef({ ids, children, ...properties }) {
      // ids가 배열이면 그대로 사용, 아니면 배열로 변환
      const idArray = Array.isArray(ids) ? ids : [ids];
      return (
        <div {...properties} className="my-1.5 grid grid-cols-[1.75rem_1fr] items-baseline text-xs leading-relaxed">
          {/* 번호가 본문 각주로 돌아가는 링크이자 각주가 가리키는 도착점이다 */}
          <span className="flex flex-wrap gap-x-1 tabular-nums">
            {idArray.map((id) => (
              <a
                key={id}
                id={`fn-${id}`}
                href={`#fnref-${id}`}
                className="scroll-mt-20 text-[var(--markdown-link)] no-underline underline-offset-2 hover:underline"
              >
                {id}
              </a>
            ))}
          </span>

          <div className="min-w-0 break-words text-foreground/70">{children}</div>
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
