import { FileSystemUtils } from "./file-system";

/**
 * 기본 메타데이터 인터페이스
 */
export interface BaseMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  other?: Record<string, unknown>;
}

/**
 * 메타데이터 파싱 전략 인터페이스
 */
export interface MetadataParser<T extends BaseMetadata> {
  parse(content: string): T | null;
}

/**
 * MDX 파일의 메타데이터 파서
 */
export class MDXMetadataParser<T extends BaseMetadata> implements MetadataParser<T> {
  parse(content: string): T | null {
    try {
      // export const metadata = {...} 형태의 메타데이터 추출
      const metadataRegex = /export const metadata = ({[\s\S]*?});/;
      const match = content.match(metadataRegex);

      if (!match) {
        throw new Error("메타데이터를 찾을 수 없습니다");
      }

      // Function 생성자를 사용해 안전하게 JavaScript 객체로 변환
      const metadataCode = `return ${match[1]}`;
      const metadata = new Function(metadataCode)() as T;

      return metadata;
    } catch (error) {
      console.error("메타데이터 파싱 실패:", error);
      return null;
    }
  }
}

/**
 * 메타데이터 매니저 - 파일에서 메타데이터를 추출하는 중앙 관리자
 */
export class MetadataManager {
  /**
   * 파일에서 메타데이터를 추출합니다
   */
  static async extractFromFile<T extends BaseMetadata>(filePath: string, parser: MetadataParser<T>): Promise<T | null> {
    try {
      const content = await FileSystemUtils.readFile(filePath);
      return parser.parse(content);
    } catch (error) {
      console.error(`메타데이터 추출 실패: ${filePath}`, error);
      return null;
    }
  }

  /**
   * 여러 파일에서 메타데이터를 병렬로 추출합니다
   */
  static async extractFromFiles<T extends BaseMetadata>(filePaths: string[], parser: MetadataParser<T>): Promise<(T | null)[]> {
    const promises = filePaths.map((filePath) => this.extractFromFile(filePath, parser));
    return Promise.all(promises);
  }
}

/**
 * 파일명 유틸리티
 */
export class FileNameUtils {
  /**
   * 파일명에서 확장자를 제거합니다
   */
  static removeExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, "");
  }

  /**
   * 파일명에서 날짜를 추출합니다 (YYYY-MM-DD 형태)
   */
  static extractDate(fileName: string): string {
    const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1]! : "";
  }

  /**
   * 파일명에서 slug를 생성합니다
   */
  static generateSlug(fileName: string): string {
    return this.removeExtension(fileName);
  }
}
