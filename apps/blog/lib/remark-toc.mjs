import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

/** 목차에 노출되는 수식 기호 (표시용, id 계산에는 쓰지 않는다) */
const LATEX_SYMBOLS = {
  alpha: "\u03b1", beta: "\u03b2", gamma: "\u03b3", delta: "\u03b4", epsilon: "\u03b5",
  theta: "\u03b8", lambda: "\u03bb", mu: "\u03bc", pi: "\u03c0", rho: "\u03c1",
  sigma: "\u03c3", tau: "\u03c4", phi: "\u03c6", omega: "\u03c9",
  Delta: "\u0394", Sigma: "\u03a3", Omega: "\u03a9",
  ge: "\u2265", le: "\u2264", ne: "\u2260", approx: "\u2248", pm: "\u00b1",
  times: "\u00d7", cdot: "\u00b7", infty: "\u221e", in: "\u2208",
  rightarrow: "\u2192", leftarrow: "\u2190", to: "\u2192",
};

/** `$k \ge 10$` 같은 수식을 목차에 보여줄 평문으로 바꾼다. 모르는 명령은 백슬래시만 뗀다. */
function latexToText(value) {
  return value
    .replace(/\\([a-zA-Z]+)/g, (_, name) => LATEX_SYMBOLS[name] ?? name)
    .replace(/[{}$]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** 표시용 제목. mdast-util-to-string과 달리 수식 노드를 사람이 읽을 수 있게 편다. */
function toTitle(heading) {
  let title = "";
  visit(heading, (node) => {
    if (node.type === "inlineMath" || node.type === "math") title += latexToText(node.value);
    else if (node.type === "text" || node.type === "inlineCode") title += node.value;
  });
  return title.trim();
}

/** 값이 문자열/숫자인 평범한 객체 배열을 estree 표현식으로 변환 */
function toArrayExpression(items) {
  return {
    type: "ArrayExpression",
    elements: items.map((item) => ({
      type: "ObjectExpression",
      properties: Object.entries(item).map(([key, value]) => ({
        type: "Property",
        kind: "init",
        method: false,
        shorthand: false,
        computed: false,
        key: { type: "Identifier", name: key },
        value: { type: "Literal", value },
      })),
    })),
  };
}

/**
 * 문서의 heading에서 목차를 뽑아 `export const toc`로 주입한다.
 *
 * slug는 rehype-slug(github-slugger)와 동일한 규칙·동일한 순서로 만들기 때문에
 * 실제 heading에 붙는 id와 항상 일치한다. remark 단계라 수식/인라인 코드도
 * KaTeX 변환 이전의 원본 텍스트로 읽힌다.
 */
export default function remarkToc({ depth = 2 } = {}) {
  return (tree) => {
    const slugger = new GithubSlugger();
    const items = [];

    visit(tree, "heading", (node) => {
      // id는 rehype-slug가 보는 것과 똑같은 원본 텍스트로 만들어야 한다.
      // 중복 카운터도 맞아야 하므로 depth와 무관하게 모든 heading을 slugger에 통과시킨다.
      const id = slugger.slug(toString(node));
      if (node.depth === depth) items.push({ title: toTitle(node), id });
    });

    tree.children.unshift({
      type: "mdxjsEsm",
      value: `export const toc = ${JSON.stringify(items)};`,
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              specifiers: [],
              source: null,
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: "toc" },
                    init: toArrayExpression(items),
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
}
