import path from "path";
import { FileSystemUtils } from "../../core/file-system";
import { MDXMetadataParser, MetadataManager } from "../../core/metadata";
import { NoteMetadata, NoteStructure, NoteItem } from "./notes.types";

/**
 * Notes 콘텐츠 리더 클래스 (계층 구조 지원)
 */
export class NotesContentReader {
  private readonly contentPath: string;
  private readonly metadataParser: MDXMetadataParser<NoteMetadata>;

  constructor() {
    this.contentPath = path.join(process.cwd(), "content");
    this.metadataParser = new MDXMetadataParser<NoteMetadata>();
  }

  /**
   * 모든 카테고리를 가져옵니다
   */
  async getCategories(): Promise<string[]> {
    return FileSystemUtils.getFolderNames(this.contentPath);
  }

  /**
   * 특정 카테고리의 서브카테고리를 가져옵니다
   */
  async getSubCategories(category: string): Promise<string[]> {
    const categoryPath = path.join(this.contentPath, category);
    return FileSystemUtils.getFolderNames(categoryPath);
  }

  /**
   * 특정 카테고리/서브카테고리의 슬러그들을 가져옵니다
   */
  async getSlugs(category: string, subCategory: string): Promise<string[]> {
    const subCategoryPath = path.join(this.contentPath, category, subCategory);
    const folders = await FileSystemUtils.getFolderNames(subCategoryPath);
    // img 폴더는 제외
    return folders.filter((folder) => folder !== "img");
  }

  /**
   * 전체 노트 구조를 가져옵니다
   */
  async getNoteStructure(): Promise<NoteStructure> {
    const structure: NoteStructure = {};
    const categories = await this.getCategories();

    for (const category of categories) {
      structure[category] = {};
      const subCategories = await this.getSubCategories(category);

      for (const subCategory of subCategories) {
        structure[category][subCategory] = await this.getSlugs(category, subCategory);
      }
    }

    return structure;
  }

  /**
   * 특정 노트의 메타데이터를 가져옵니다
   */
  async getNoteMetadata(category: string, subCategory: string, slug: string): Promise<NoteMetadata | null> {
    const filePath = path.join(this.contentPath, category, subCategory, slug, "page.mdx");
    return MetadataManager.extractFromFile(filePath, this.metadataParser);
  }

  /**
   * 특정 노트 아이템을 생성합니다
   */
  async createNoteItem(category: string, subCategory: string, slug: string): Promise<NoteItem | null> {
    const metadata = await this.getNoteMetadata(category, subCategory, slug);
    if (!metadata) return null;

    return {
      category,
      subCategory,
      slug,
      metadata,
      filePath: path.join(this.contentPath, category, subCategory, slug, "page.mdx"),
    };
  }

  /**
   * 모든 노트 아이템을 가져옵니다
   */
  async getAllNoteItems(): Promise<NoteItem[]> {
    const structure = await this.getNoteStructure();
    const items: NoteItem[] = [];

    for (const [category, subCategories] of Object.entries(structure)) {
      for (const [subCategory, slugs] of Object.entries(subCategories)) {
        for (const slug of slugs) {
          const item = await this.createNoteItem(category, subCategory, slug);
          if (item) {
            items.push(item);
          }
        }
      }
    }

    return items;
  }

  /**
   * 특정 카테고리의 노트들을 가져옵니다
   */
  async getNotesByCategory(category: string): Promise<NoteItem[]> {
    const items: NoteItem[] = [];
    const subCategories = await this.getSubCategories(category);

    for (const subCategory of subCategories) {
      const slugs = await this.getSlugs(category, subCategory);
      for (const slug of slugs) {
        const item = await this.createNoteItem(category, subCategory, slug);
        if (item) {
          items.push(item);
        }
      }
    }

    return items;
  }

  /**
   * 특정 서브카테고리의 노트들을 가져옵니다
   */
  async getNotesBySubCategory(category: string, subCategory: string): Promise<NoteItem[]> {
    const items: NoteItem[] = [];
    const slugs = await this.getSlugs(category, subCategory);

    for (const slug of slugs) {
      const item = await this.createNoteItem(category, subCategory, slug);
      if (item) {
        items.push(item);
      }
    }

    return items;
  }

  /**
   * 상태별로 노트를 필터링합니다
   */
  async getNotesByStatus(status: "ready" | "draft"): Promise<NoteItem[]> {
    const allItems = await this.getAllNoteItems();
    return allItems.filter((item) => item.metadata.other.status === status);
  }

  /**
   * 고정된 노트들을 가져옵니다
   */
  async getPinnedNotes(): Promise<NoteItem[]> {
    const allItems = await this.getAllNoteItems();
    return allItems.filter((item) => item.metadata.pinned === true);
  }

  /**
   * 노트 콘텐츠를 가져옵니다
   */
  async getNoteContent(category: string, subCategory: string, slug: string): Promise<string> {
    const filePath = path.join(this.contentPath, category, subCategory, slug, "page.mdx");
    const content = await FileSystemUtils.readFile(filePath);
    // 메타데이터 부분 제거
    return content.replace(/export const metadata = {[\s\S]*?};\s*/, "");
  }
}

// 싱글톤 인스턴스 생성
const notesReader = new NotesContentReader();

// 기존 API와 호환성을 위한 래퍼 함수들
export const getCategories = () => notesReader.getCategories();
export const getSubCategoriesByCategory = (category: string) => notesReader.getSubCategories(category);
export const getSlugsByCategoryAndSub = (category: string, subCategory: string) => notesReader.getSlugs(category, subCategory);
export const getSlugMetadata = (category: string, subCategory: string, slug: string) => notesReader.getNoteMetadata(category, subCategory, slug);

// 새로운 API
export const getNoteStructure = () => notesReader.getNoteStructure();
export const getAllNotes = () => notesReader.getAllNoteItems();
export const getNotesByCategory = (category: string) => notesReader.getNotesByCategory(category);
export const getNotesBySubCategory = (category: string, subCategory: string) => notesReader.getNotesBySubCategory(category, subCategory);
export const getNotesByStatus = (status: "ready" | "draft") => notesReader.getNotesByStatus(status);
export const getPinnedNotes = () => notesReader.getPinnedNotes();
export const getNoteContent = (category: string, subCategory: string, slug: string) => notesReader.getNoteContent(category, subCategory, slug);
