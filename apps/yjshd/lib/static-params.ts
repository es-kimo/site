import { categoryParams, slugParams, subCategoryParams } from "@workspace/common/structure/params";
import type { CategoryParams, SlugParams, SubCategoryParams } from "@workspace/common/structure/params.types";
import fs from "fs";
import path from "path";

/**
 * `app/(dynamic)` 아래에는 전용으로 작성한 페이지들이 있습니다. (`/4.게시판`, `/3.강좌/2.콩팥질환 정보` 등)
 *
 * 이 경로들은 `(static)` 그룹의 동적 세그먼트보다 우선순위가 높아 실제 요청을 가져가므로,
 * `generateStaticParams`가 같은 경로를 중복으로 prerender하지 않도록 제외해야 합니다.
 * (제외하지 않으면 `page.mdx`가 없는 경로까지 읽으려다 빌드가 ENOENT로 실패합니다.)
 *
 * 목록을 손으로 관리하면 `(dynamic)`에 페이지를 추가할 때마다 빌드가 깨지므로,
 * 디렉터리를 직접 훑어서 도출합니다. 빌드 타임에만 호출됩니다.
 */
function collectExplicitRoutes(): Set<string> {
  const root = path.join(process.cwd(), "app", "(dynamic)");
  const routes = new Set<string>();

  const walk = (dir: string, segments: string[]) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      const child = path.join(dir, entry.name);
      // 라우트 그룹 `(...)`은 URL 경로에 포함되지 않습니다.
      const isRouteGroup = entry.name.startsWith("(") && entry.name.endsWith(")");
      const nextSegments = isRouteGroup ? segments : [...segments, decodeURIComponent(entry.name)];

      if (!isRouteGroup && fs.existsSync(path.join(child, "page.tsx"))) {
        routes.add(nextSegments.join("/"));
      }

      walk(child, nextSegments);
    }
  };

  if (fs.existsSync(root)) walk(root, []);

  return routes;
}

const withoutExplicitRoutes = <T>(params: T[], toPath: (param: T) => string[]): T[] => {
  const explicitRoutes = collectExplicitRoutes();
  return params.filter((param) => !explicitRoutes.has(toPath(param).join("/")));
};

export const staticCategoryParams = (): CategoryParams[] => withoutExplicitRoutes(categoryParams, ({ category }) => [category]);

export const staticSubCategoryParams = (): SubCategoryParams[] => withoutExplicitRoutes(subCategoryParams, ({ category, subCategory }) => [category, subCategory]);

export const staticSlugParams = (): SlugParams[] => withoutExplicitRoutes(slugParams, ({ category, subCategory, slug }) => [category, subCategory, slug]);
