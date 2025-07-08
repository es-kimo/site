import fs from "fs";
import path from "path";

/**
 * 기본 파일시스템 유틸리티 클래스
 */
export class FileSystemUtils {
  /**
   * 디렉토리 내의 폴더명들을 가져옵니다
   */
  static async getFolderNames(directoryPath: string): Promise<string[]> {
    try {
      const items = await fs.promises.readdir(directoryPath, { withFileTypes: true });
      return items.filter((item) => item.isDirectory()).map((folder) => folder.name);
    } catch (error) {
      console.error(`폴더 읽기 실패: ${directoryPath}`, error);
      return [];
    }
  }

  /**
   * 디렉토리 내의 파일명들을 가져옵니다
   */
  static async getFileNames(directoryPath: string, extension?: string): Promise<string[]> {
    try {
      const items = await fs.promises.readdir(directoryPath);
      return extension ? items.filter((item) => item.endsWith(extension)) : items.filter((item) => !fs.statSync(path.join(directoryPath, item)).isDirectory());
    } catch (error) {
      console.error(`파일 읽기 실패: ${directoryPath}`, error);
      return [];
    }
  }

  /**
   * 파일 내용을 읽어옵니다
   */
  static async readFile(filePath: string, encoding: BufferEncoding = "utf-8"): Promise<string> {
    try {
      return await fs.promises.readFile(filePath, encoding);
    } catch (error) {
      console.error(`파일 읽기 실패: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 파일이 존재하는지 확인합니다
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 파일 또는 디렉토리의 stats를 가져옵니다
   */
  static async getStats(filePath: string): Promise<fs.Stats | null> {
    try {
      return await fs.promises.stat(filePath);
    } catch (error) {
      console.error(`Stats 가져오기 실패: ${filePath}`, error);
      return null;
    }
  }
}
