import { PostMetadata } from "@workspace/common/content/metadata.types";
import { ComponentType } from "react";

export const PAGE_H1 = "연세정성내과의원";

// TODO: metadata의 타입가드 및 불일치시 에러 던지기
export const getPostMetadata = async ({ category, subCategory, slug }: { category: string; subCategory?: string; slug?: string }): Promise<PostMetadata> => {
  if (slug) {
    if (!subCategory) {
      const { metadata } = await import(`@/content/${category}/${slug}/page.mdx`);
      return metadata;
    }

    const { metadata } = await import(`@/content/${category}/${subCategory}/${slug}/page.mdx`);
    return metadata;
  }

  const { metadata } = await import(`@/content/${category}/${subCategory}/page.mdx`);
  return metadata;
};

export const getPostContent = async ({ category, subCategory, slug }: { category: string; subCategory?: string; slug?: string }): Promise<ComponentType> => {
  if (slug) {
    const { default: content } = await import(`@/content/${category}/${subCategory}/${slug}/page.mdx`);
    return content;
  }

  const { default: content } = await import(`@/content/${category}/${subCategory}/page.mdx`);
  return content;
};
