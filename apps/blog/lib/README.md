# Content Management System Architecture

## 📁 새로운 폴더 구조

```
lib/
├── core/                    # 핵심 기능
│   ├── file-system.ts      # 파일시스템 유틸리티
│   ├── metadata.ts         # 메타데이터 파싱
│   ├── content-reader.ts   # 콘텐츠 리더 베이스 클래스
│   └── index.ts           # core 모듈 통합
├── content/                # 도메인별 콘텐츠 리더
│   ├── inspiration/        # inspiration 도메인
│   │   ├── inspiration.ts
│   │   └── inspiration.types.ts
│   ├── notes/             # notes 도메인
│   │   ├── notes.ts
│   │   └── notes.types.ts
│   └── index.ts           # content 모듈 통합
├── utils/                 # 유틸리티 함수들
│   └── index.ts
├── github.ts             # GitHub API (기존)
├── file-system.ts        # Legacy (호환성 유지)
└── index.ts              # 전체 lib 통합
```

## 🏗️ 아키텍처 원칙

### 1. 계층화된 구조

- **Core Layer**: 모든 콘텐츠 타입이 공통으로 사용하는 기본 기능
- **Domain Layer**: 각 콘텐츠 타입별 특화된 로직
- **Utility Layer**: 보조 기능들

### 2. 확장 가능한 디자인

- `BaseContentReader`를 상속받아 새로운 콘텐츠 타입 쉽게 추가
- Strategy 패턴으로 메타데이터 파싱 방식 변경 가능
- 인터페이스 기반 설계로 구현체 교체 용이

### 3. 타입 안전성

- 모든 메타데이터는 `BaseMetadata`를 확장
- 도메인별 타입 정의로 런타임 에러 방지
- Generic을 활용한 타입 추론

## 🚀 사용법

### 기본 사용법 (새로운 API)

```typescript
// Inspiration 콘텐츠 읽기
import { InspirationContentReader } from "@/lib/content/inspiration/inspiration";

const reader = new InspirationContentReader();

// 모든 포스트 가져오기 (정렬된)
const posts = await reader.getSortedItems();

// 특정 포스트 가져오기
const post = await reader.getItemBySlug("my-post");

// 상태별 필터링
const readyPosts = await reader.getItemsByStatus("ready");

// 작성자별 필터링
const authorPosts = await reader.getItemsByAuthor("Kihyun Ryu");
```

### 기존 API (호환성 유지)

```typescript
// 기존 코드는 그대로 작동
import { getAllInspirationPosts, getInspirationPostBySlug } from "@/lib/inspiration";

const posts = await getAllInspirationPosts();
const post = await getInspirationPostBySlug("my-post");
```

### Notes 콘텐츠 (계층 구조)

```typescript
import { NotesContentReader } from "@/lib/content/notes/notes";

const reader = new NotesContentReader();

// 전체 구조 가져오기
const structure = await reader.getNoteStructure();

// 카테고리별 노트
const categoryNotes = await reader.getNotesByCategory("frontend");

// 특정 노트
const note = await reader.createNoteItem("frontend", "react", "hooks");
```

## 🔧 새로운 콘텐츠 타입 추가하기

### 1. 타입 정의

```typescript
// lib/content/blog/blog.types.ts
import { BaseMetadata } from "../../core/metadata";

export interface BlogMetadata extends BaseMetadata {
  title: string;
  author: string;
  publishedAt: string;
  tags: string[];
}
```

### 2. 콘텐츠 리더 구현

```typescript
// lib/content/blog/blog.ts
import { BaseContentReader } from "../../core/content-reader";
import { BlogMetadata } from "./blog.types";

export class BlogContentReader extends BaseContentReader<BlogMetadata> {
  constructor() {
    super({
      contentPath: path.join(process.cwd(), "content", "blog"),
      fileExtension: ".md",
      metadataParser: new MDXMetadataParser<BlogMetadata>(),
    });
  }

  protected sortItems(items: ContentItem<BlogMetadata>[]): ContentItem<BlogMetadata>[] {
    return items.sort((a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime());
  }

  // 도메인 특화 메서드들
  async getPostsByTag(tag: string) {
    const items = await this.getSortedItems();
    return items.filter((item) => item.metadata.tags.includes(tag));
  }
}
```

## 📋 마이그레이션 가이드

### Phase 1: 호환성 유지

- 기존 코드는 그대로 작동
- 새로운 기능 개발 시 새로운 API 사용

### Phase 2: 점진적 마이그레이션

- 기존 함수를 새로운 클래스 기반 API로 교체
- 테스트 코드 업데이트

### Phase 3: 레거시 제거

- 충분한 테스트 후 기존 파일들 제거
- Import 경로 정리

## 🎯 장점

1. **코드 재사용성**: 공통 로직을 core에서 관리
2. **타입 안전성**: 컴파일 타임에 에러 발견 가능
3. **확장성**: 새로운 콘텐츠 타입 쉽게 추가
4. **유지보수성**: 도메인별로 분리된 구조
5. **테스트 용이성**: 각 컴포넌트의 독립적 테스트 가능
6. **호환성**: 기존 코드 영향 없음

## 🔍 성능 최적화

- 메타데이터 캐싱 메커니즘
- 병렬 파일 읽기
- 지연 로딩 지원
- 메모리 효율적인 대용량 파일 처리
