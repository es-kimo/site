import path from "path";
import { BaseContentReader, ContentItem } from "../../core/content-reader";
import { MDXMetadataParser } from "../../core/metadata";
import { InspirationMetadata } from "./inspiration.types";

/**
 * Inspiration 콘텐츠 리더 클래스
 */
export class InspirationContentReader extends BaseContentReader<InspirationMetadata> {
  constructor() {
    super({
      contentPath: path.join(process.cwd(), "content", "inspiration"),
      fileExtension: ".mdx",
      metadataParser: new MDXMetadataParser<InspirationMetadata>(),
    });
  }

  /**
   * 생성날짜 기준으로 최신순 정렬
   */
  protected sortItems(items: ContentItem<InspirationMetadata>[]): ContentItem<InspirationMetadata>[] {
    return items.sort((a, b) => {
      const dateA = new Date(a.metadata.other.createdAt);
      const dateB = new Date(b.metadata.other.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * 날짜 문자열을 포맷팅합니다
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * 상태별로 필터링합니다
   */
  async getItemsByStatus(status: "ready" | "draft"): Promise<ContentItem<InspirationMetadata>[]> {
    const items = await this.getSortedItems();
    return items.filter((item) => item.metadata.other.status === status);
  }

  /**
   * 작성자별로 필터링합니다
   */
  async getItemsByAuthor(author: string): Promise<ContentItem<InspirationMetadata>[]> {
    const items = await this.getSortedItems();
    return items.filter((item) => item.metadata.other.author === author);
  }

  /**
   * 키워드별로 필터링합니다
   */
  async getItemsByKeyword(keyword: string): Promise<ContentItem<InspirationMetadata>[]> {
    const items = await this.getSortedItems();
    return items.filter((item) => item.metadata.keywords.includes(keyword));
  }
}

// 싱글톤 인스턴스 생성
const inspirationReader = new InspirationContentReader();

// 기존 API와 호환성을 위한 래퍼 함수들
export const getAllInspirationPosts = async () => {
  const items = await inspirationReader.getSortedItems();
  return items.map((item) => ({
    slug: item.slug,
    metadata: item.metadata,
    filePath: item.filePath,
    fileName: item.fileName,
  }));
};

export const getInspirationPostBySlug = async (slug: string) => {
  const item = await inspirationReader.getItemBySlug(slug);
  if (!item) return null;

  return {
    slug: item.slug,
    metadata: item.metadata,
    filePath: item.filePath,
    fileName: item.fileName,
  };
};

export const formatInspirationDate = (dateString: string): string => {
  return inspirationReader.formatDate(dateString);
};

// 새로운 API 함수들
export const getInspirationByStatus = (status: "ready" | "draft") => {
  return inspirationReader.getItemsByStatus(status);
};

export const getInspirationByAuthor = (author: string) => {
  return inspirationReader.getItemsByAuthor(author);
};

export const getInspirationByKeyword = (keyword: string) => {
  return inspirationReader.getItemsByKeyword(keyword);
};

export const getInspirationContent = (slug: string) => {
  return inspirationReader.getContentOnly(`${slug}.mdx`);
};
