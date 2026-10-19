/**
 * 글 페이지(@next/mdx)와 /preview(브라우저 컴파일)가 같이 쓰는 remark·rehype 플러그인 목록. 순서가 곧 실행 순서다.
 *
 * - `name`: @next/mdx에 넘길 모듈 이름. `./`로 시작하면 apps/blog 기준 경로다.
 * - `load`: /preview가 원문을 받은 뒤 부른다. 서버 렌더링에서 shiki를 불러오지 않도록 미리 import하지 않는다.
 *
 * @typedef {{ name: string; options?: unknown; load: () => Promise<{ default: unknown }> }} MdxPlugin
 */

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
  theme: {
    dark: "monokai",
    light: "github-light-high-contrast",
  },
  keepBackground: false,
};

/** @type {MdxPlugin[]} */
export const remarkPlugins = [
  { name: "remark-gfm", load: () => import("remark-gfm") },
  { name: "remark-math", load: () => import("remark-math") },
  { name: "./lib/remark-toc.mjs", load: () => import("./remark-toc.mjs") },
];

/** @type {MdxPlugin[]} */
export const rehypePlugins = [
  // rehype-slug는 rehype-katex보다 먼저 돌아야 수식 heading의 id가 깨지지 않는다
  { name: "rehype-slug", load: () => import("rehype-slug") },
  { name: "rehype-katex", load: () => import("rehype-katex") },
  { name: "rehype-pretty-code", options: prettyCodeOptions, load: () => import("rehype-pretty-code") },
];
