import path from "path";
import { FileSystemUtils } from "./file-system";
import { BaseMetadata, MetadataParser, MetadataManager, FileNameUtils } from "./metadata";

/**
 * 콘텐츠 아이템 인터페이스
 */
export interface ContentItem<T extends BaseMetadata> {
  slug: string;
  fileName: string;
  filePath: string;
  metadata: T;
}

/**
 * 콘텐츠 리더 설정 인터페이스
 */
export interface ContentReaderConfig<T extends BaseMetadata> {
  contentPath: string;
  fileExtension: string;
  metadataParser: MetadataParser<T>;
}

/**
 * 콘텐츠 리더 베이스 클래스
 * 모든 콘텐츠 타입이 상속받을 수 있는 기본 기능 제공
 */
export abstract class BaseContentReader<T extends BaseMetadata> {
  protected config: ContentReaderConfig<T>;

  constructor(config: ContentReaderConfig<T>) {
    this.config = config;
  }

  /**
   * 콘텐츠 디렉토리의 모든 파일을 가져옵니다
   */
  async getFileNames(): Promise<string[]> {
    return FileSystemUtils.getFileNames(this.config.contentPath, this.config.fileExtension);
  }

  /**
   * 특정 파일의 메타데이터를 가져옵니다
   */
  async getMetadata(fileName: string): Promise<T | null> {
    const filePath = path.join(this.config.contentPath, fileName);
    return MetadataManager.extractFromFile(filePath, this.config.metadataParser);
  }

  /**
   * 모든 파일의 메타데이터를 가져옵니다
   */
  async getAllMetadata(): Promise<(T | null)[]> {
    const fileNames = await this.getFileNames();
    const filePaths = fileNames.map((fileName) => path.join(this.config.contentPath, fileName));
    return MetadataManager.extractFromFiles(filePaths, this.config.metadataParser);
  }

  /**
   * 단일 콘텐츠 아이템을 생성합니다
   */
  async createContentItem(fileName: string): Promise<ContentItem<T> | null> {
    const metadata = await this.getMetadata(fileName);
    if (!metadata) return null;

    return {
      slug: FileNameUtils.generateSlug(fileName),
      fileName,
      filePath: path.join(this.config.contentPath, fileName),
      metadata,
    };
  }

  /**
   * 모든 콘텐츠 아이템을 가져옵니다
   */
  async getAllItems(): Promise<ContentItem<T>[]> {
    const fileNames = await this.getFileNames();
    const items: ContentItem<T>[] = [];

    for (const fileName of fileNames) {
      const item = await this.createContentItem(fileName);
      if (item) {
        items.push(item);
      }
    }

    return items;
  }

  /**
   * slug로 특정 콘텐츠 아이템을 가져옵니다
   */
  async getItemBySlug(slug: string): Promise<ContentItem<T> | null> {
    const fileName = `${slug}${this.config.fileExtension}`;
    const filePath = path.join(this.config.contentPath, fileName);

    if (!(await FileSystemUtils.exists(filePath))) {
      return null;
    }

    return this.createContentItem(fileName);
  }

  /**
   * 콘텐츠를 정렬합니다 (서브클래스에서 구현)
   */
  protected abstract sortItems(items: ContentItem<T>[]): ContentItem<T>[];

  /**
   * 정렬된 모든 콘텐츠 아이템을 가져옵니다
   */
  async getSortedItems(): Promise<ContentItem<T>[]> {
    const items = await this.getAllItems();
    return this.sortItems(items);
  }

  /**
   * 콘텐츠 파일의 원본 내용을 가져옵니다
   */
  async getFileContent(fileName: string): Promise<string> {
    const filePath = path.join(this.config.contentPath, fileName);
    return FileSystemUtils.readFile(filePath);
  }

  /**
   * 메타데이터를 제거한 순수 콘텐츠만 가져옵니다
   */
  async getContentOnly(fileName: string): Promise<string> {
    const fileContent = await this.getFileContent(fileName);
    // 메타데이터 부분 제거
    return fileContent.replace(/export const metadata = {[\s\S]*?};\s*/, "");
  }
}
