import { joinPath } from "@workspace/common/lib/path.js";
import { ENTRY_POINT } from "@workspace/common/structure/utils.js";

/**
 * 글 정보 가져오기
 *
 * import 경로를 `common` 패키지 기준으로 잡게되어 cannot find module 에러가 발생합니다.
 *
 * const { metadata } = await import(`@/content/${category}/${sub}/${slug}/page.mdx`); //error
 */
export const buildPostMetadataImportPath = ({ category, subCategory, slug }: { category: string; subCategory?: string; slug: string }) => {
  if (subCategory === undefined) {
    return joinPath("@", ENTRY_POINT, category, `${slug}.mdx`);
  }

  return joinPath("@", ENTRY_POINT, category, subCategory, slug, "page.mdx");
};
