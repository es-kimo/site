import { PostMetadata } from "@workspace/common/content/metadata.types";
import { ComponentType } from "react";

export const PAGE_H1 = "연세정성내과의원";

// TODO: metadata의 타입가드 및 불일치시 에러 던지기
export const getPostMetadata = async ({ category, subCategory, slug }: { category: string; subCategory?: string; slug?: string }): Promise<PostMetadata> => {
  if (subCategory === undefined) {
    if (slug) {
      const { metadata } = await import(`@/content/${category}/${slug}.mdx`);
      return metadata;
    }

    throw new Error("subCategory와 slug 중 하나는 명시해야합니다.");
  }

  const { metadata } = await import(`@/content/${category}/${subCategory}/page.mdx`);
  return metadata;
};

export const getPostContent = async ({ category, subCategory, slug }: { category: string; subCategory?: string; slug?: string }): Promise<ComponentType> => {
  if (subCategory === undefined) {
    if (slug) {
      const { default: content } = await import(`@/content/${category}/${slug}.mdx`);
      return content;
    }

    throw new Error("subCategory와 slug 중 하나는 명시해야합니다.");
  }

  const { default: content } = await import(`@/content/${category}/${subCategory}/page.mdx`);
  return content;
};
