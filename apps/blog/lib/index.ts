// Core functionality
export * from "./core";

// Content readers
export * from "./content";

// Utilities
export * from "./utils";

// Legacy support - 기존 파일들에 대한 재export
export * from "./file-system";

// README for migration
/**
 * 새로운 구조 사용 가이드:
 *
 * ## 1. Core 기능:
 *    - FileSystemUtils: 파일시스템 유틸리티
 *    - MetadataManager: 메타데이터 추출
 *    - BaseContentReader: 콘텐츠 리더 베이스 클래스
 *
 * ## 2. Content readers:
 *    - InspirationContentReader: inspiration 콘텐츠 (✅ 마이그레이션 완료)
 *    - NotesContentReader: notes 콘텐츠
 *
 * ## 3. 마이그레이션 현황:
 *    - ✅ Inspiration: 새로운 클래스 기반 API로 완전 마이그레이션
 *    - ⏳ Notes: 기존 API 유지 (추후 마이그레이션 예정)
 *
 * ## 4. 새로운 클래스 기반 API 장점:
 *    - 고급 필터링 (상태, 작성자, 키워드별)
 *    - 병렬 파일 처리로 향상된 성능
 *    - 종합적인 메타데이터 추출
 *    - 내장 날짜 포맷팅 및 유틸리티
 *    - 확장 가능한 아키텍처
 *
 * ## 5. 사용 예시:
 * ```typescript
 * // 새로운 방식 (권장) - Inspiration
 * import { InspirationContentReader } from '@/lib/content';
 * const reader = new InspirationContentReader();
 *
 * // 다양한 필터링 옵션
 * const allPosts = await reader.getSortedItems();
 * const publishedPosts = await reader.getItemsByStatus('ready');
 * const authorPosts = await reader.getItemsByAuthor('John Doe');
 * const keywordPosts = await reader.getItemsByKeywords(['React']);
 *
 * // 기존 방식 (여전히 작동) - Notes
 * import { getAllNotes } from '@/lib/notes';
 * const notes = await getAllNotes();
 * ```
 */
