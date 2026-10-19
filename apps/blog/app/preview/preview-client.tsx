"use client";

import { DEFAULT_SIZE_INDEX } from "@/components/DynamicIsland/Reader/constants";
import { applyArticleFontSize, readSavedSizeIndex } from "@/components/DynamicIsland/Reader/font-size";
import { editorOrigins } from "@/lib/editor-origins.mjs";
import { rehypePlugins, remarkPlugins, type MdxPlugin } from "@/lib/mdx-plugins.mjs";
import { useMDXComponents } from "@/mdx-components";
import { hydrate, type MDXComponents } from "next-mdx-remote-client/csr";
import type { serialize } from "next-mdx-remote-client/serialize";
import { Component, useEffect, useState, type ReactNode } from "react";

type PreviewMessage = {
  type: "preview";
  source: string;
  /** import 변수명 → 이미지. 에디터의 blob: 주소는 이 origin에서 열리지 않아 Blob 자체를 받는다. */
  images?: Record<string, { blob: Blob; width: number; height: number }>;
};

type PluginList = NonNullable<NonNullable<NonNullable<Parameters<typeof serialize>[0]["options"]>["mdxOptions"]>["remarkPlugins"]>;

/** 플러그인을 불러와 unified가 받는 [plugin, options] 목록으로 만든다 */
function loadPlugins(plugins: MdxPlugin[]) {
  return Promise.all(
    plugins.map(async ({ options, load }) => {
      const { default: plugin } = await load();
      return options ? [plugin, options] : plugin;
    }),
  ) as Promise<PluginList>;
}

let pluginsLoading: Promise<[PluginList, PluginList]> | undefined;

type EsmNode = { type: string; data?: { estree?: { body: { type: string; source?: { value: unknown }; specifiers?: { local: { name: string } }[] }[] } } };

/** import 선언의 변수명과 경로를 모은다. 선언은 disableImports가 이 플러그인 다음에 지운다. */
function collectImports(found: Map<string, string>) {
  return () => (tree: { children: EsmNode[] }) => {
    for (const node of tree.children) {
      if (node.type !== "mdxjsEsm") continue;
      for (const statement of node.data?.estree?.body ?? []) {
        if (statement.type !== "ImportDeclaration") continue;
        for (const { local } of statement.specifiers ?? []) found.set(local.name, String(statement.source?.value));
      }
    }
  };
}

// 컴파일러와 shiki는 크고 서버 렌더링에서 불러오면 실패한다. 원문을 받은 뒤 브라우저에서만 불러온다.
async function compile(source: string) {
  pluginsLoading ??= Promise.all([loadPlugins(remarkPlugins), loadPlugins(rehypePlugins)]);
  const [{ serialize }, [remark, rehype]] = await Promise.all([import("next-mdx-remote-client/serialize"), pluginsLoading]);
  const imports = new Map<string, string>();
  const result = await serialize({
    source,
    options: {
      disableImports: true,
      mdxOptions: { remarkPlugins: [collectImports(imports), ...remark], rehypePlugins: rehype },
    },
  });
  return { result, imports };
}

const IMAGE_PATH = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

/** 에디터가 보내지 않은 import(레포에 이미 있는 이미지 등)를 자리표시로 채워 나머지 본문은 그린다 */
function missingImport(path: string) {
  if (IMAGE_PATH.test(path)) {
    const label = path.replace(/[<>&"']/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="800" height="450" fill="#8882"/><text x="400" y="225" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="20" fill="#888">${label}</text></svg>`;
    return { src: `data:image/svg+xml,${encodeURIComponent(svg)}`, width: 800, height: 450 };
  }
  return function MissingImport() {
    return <span className="text-xs text-muted-foreground">미리보기에서 불러오지 못한 import: {path}</span>;
  };
}

/** 컴파일은 됐지만 그리다 실패한 경우(예: 자리표시를 다른 용도로 쓴 import) 메시지만 보여준다 */
class RenderBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return this.state.error ? <p role="alert">{this.state.error.message}</p> : this.props.children;
  }
}

type Rendered = { content: ReactNode; version: number } | { error: string };

// 훅을 쓰지 않는 함수라 한 번만 만든다. 렌더마다 만들면 아래 effect가 매번 다시 컴파일한다.
// eslint-disable-next-line react-hooks/rules-of-hooks
const components = useMDXComponents({});

export function PreviewClient() {
  const [message, setMessage] = useState<{ data: PreviewMessage; origin: string; version: number } | null>(null);
  const [rendered, setRendered] = useState<Rendered | null>(null);

  // 글 페이지는 ReaderIsland가 글자 크기 변수를 정한다. 미리보기에는 섬이 없어 같은 값을 직접 정한다.
  useEffect(() => {
    applyArticleFontSize(readSavedSizeIndex() ?? DEFAULT_SIZE_INDEX);
  }, []);

  useEffect(() => {
    // 원문은 실행 코드다. 부모 창이면서 허용한 에디터 origin이 보낸 것만 받는다.
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || !editorOrigins.includes(event.origin)) return;
      if (event.data?.type !== "preview") return;
      setMessage((previous) => ({ data: event.data as PreviewMessage, origin: event.origin, version: (previous?.version ?? 0) + 1 }));
    };
    window.addEventListener("message", onMessage);
    if (window.parent !== window) for (const origin of editorOrigins) window.parent.postMessage({ type: "preview-ready" }, origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!message) return;
    let cancelled = false;
    const urls: string[] = [];
    const images = Object.fromEntries(
      Object.entries(message.data.images ?? {}).map(([name, { blob, width, height }]) => {
        const src = URL.createObjectURL(blob);
        urls.push(src);
        return [name, { src, width, height }];
      }),
    );
    compile(message.data.source).then(({ result, imports }) => {
      if (cancelled) return;
      if ("error" in result) return setRendered({ error: result.error.message ?? "컴파일 실패" });
      const scope: Record<string, unknown> = { ...images };
      // import가 지워진 <Foo />는 scope가 아니라 components에서 찾으므로 양쪽에 둔다. 사이트 컴포넌트와 이름이 같으면 사이트 것을 쓴다.
      const withMissing: MDXComponents = { ...components };
      for (const [name, path] of imports) {
        if (name in scope) continue;
        const fallback = missingImport(path);
        scope[name] = fallback;
        if (typeof fallback === "function" && !(name in withMissing)) withMissing[name] = fallback;
      }
      const { content, error } = hydrate({ compiledSource: result.compiledSource, components: withMissing, scope });
      setRendered(error ? { error: error.message } : { content, version: message.version });
      window.parent.postMessage({ type: "preview-rendered" }, message.origin);
    });
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [message]);

  if (!rendered) return <p className="text-xs text-muted-foreground">미리보기를 기다리는 중</p>;
  if ("error" in rendered) return <p role="alert">{rendered.error}</p>;
  return <RenderBoundary key={rendered.version}>{rendered.content}</RenderBoundary>;
}
