# yjshd 페이지 로딩 성능 병목 분석

> 분석일: 2026-01-27

## 요약

페이지 전환이 느린 주요 원인은 **Server Component에서 매 요청마다 MDX 파일을 파싱하고 컴파일**하는 것입니다.

---

## 🔴 Critical: 파일 시스템 매번 탐색

### 위치: `lib/content.ts`

```typescript
// lib/content.ts (L22-L26)
export async function getMdxContent({ category, subCategory, slug }) {
  const source = fs.readFileSync(filePath, "utf-8"); // 동기 파일 읽기

  const compiled = await compile(source, {
    // 매번 MDX 컴파일
    outputFormat: "function-body",
    remarkPlugins: [remarkExtractHeadings, remarkExtractContent],
  });
  // ...
}
```

**문제점:**

- `fs.readFileSync()`로 파일을 동기적으로 읽음
- `compile()`로 MDX를 **매번** 컴파일
- 이 함수가 **TheHeader**, **AllCategoriesSheet**, **각 페이지**에서 반복 호출됨
- **캐싱 없음**

---

## 🔴 Critical: TheHeader에서 과도한 데이터 페칭

### 위치: `components/TheHeader.tsx` (L89-L98)

```typescript
const Content = async ({ category, activeSubCategory, activeHeading }) => {
  const subCategories = await Promise.all(
    (subCategoriesMap.get(category) ?? []).map(async (subCategory) => {
      const slugs = await getSlugsByCategoryAndSubCategory(category, subCategory);
      const hasSlug = slugs && slugs.length > 0;
      if (hasSlug) {
        return { subCategory, hasSlug, headings: null };
      }
      const { headings } = await getMdxContent({ category, subCategory }); // ⚠️ MDX 컴파일
      return { subCategory, hasSlug, headings: headings.filter((heading) => heading.depth === 2) };
    }),
  );
  // ...
};
```

**문제점:**

- **매 페이지 전환마다** 실행됨
- 모든 카테고리의 서브카테고리를 순회
- 각각에 대해 **파일시스템을 읽고 MDX를 컴파일**
- 카테고리가 3개, 서브카테고리가 각 3개라면 → **최대 9번의 MDX 컴파일**

---

## 🔴 Critical: AllCategoriesSheet 동일한 문제

### 위치: `components/AllCategoriesSheet.tsx` (L63-L74)

```typescript
{subCategories.map(async (subCategory) => {
  const slug = await getSlugsByCategoryAndSubCategory(category, subCategory);
  if (slug.length > 0) {
    return (/* ... */);
  }

  const { headings } = await getMdxContent({ category, subCategory });  // ⚠️ 또 MDX 컴파일
  return (/* ... */);
})}
```

**문제점:**

- TheHeader와 동일하게 모든 카테고리/서브카테고리에 대해 `getMdxContent()` 호출
- 메뉴 시트를 열 때마다가 아닌, **Server Component이므로 페이지 로드마다 실행**

---

## 🟡 Medium: 게시판 페이지 - 모든 글 메타데이터 로드

### 위치: `app/(dynamic)/4.게시판/page.tsx` (L31-L36)

```typescript
const slugs = await getSlugsByCategory(category); // 40개+ 게시글
const posts = await Promise.all(
  slugs.map(async (slug) => {
    const meta = await getPostMetadata({ category, slug }); // 동적 import
    return { ...meta, id: `${meta.other.createdAt}-${slug}`, slug };
  }),
);
```

**문제점:**

- 모든 게시글(40개+)의 메타데이터를 **매번** 동적으로 import
- `import()` 호출이 게시글 수만큼 발생

---

## 🟡 Medium: Dynamic Import for MDX

### 위치: `lib/metadata.ts` (L23-L28)

```typescript
export const getPostContent = async ({ category, subCategory, slug }) => {
  const { default: content } = await import(`@/content/${category}/${subCategory}/page.mdx`);
  return content;
};
```

**문제점:**

- 매번 `import()`로 MDX 컴포넌트를 동적으로 로드
- 번들러 최적화가 제한됨

---

## 🟡 Medium: structure.ts - Top-level Await

### 위치: `packages/common/src/structure/structure.ts`

```typescript
export const categories: readonly string[] = await getCategories();

export const subCategories2DArray: readonly string[][] = await Promise.all(categories.map((category) => getSubCategoriesByCategory(category)));

export const slugs3DArray: readonly string[][][] = await Promise.all(/* ... */);
```

**문제점:**

- Top-level await로 모듈 로드 시 **모든 파일 시스템 구조를 읽음**
- 모듈이 import될 때마다 실행될 수 있음 (번들러 설정에 따라 다름)

---

## 🟢 Good: 클라이언트 컴포넌트 동적 로딩

### 위치: `mdx-components.tsx` (L10-L12)

```typescript
const NaverMapWrapper = dynamic(() => import("./components/NaverMapWrapper"));
const ImageLightbox = dynamic(() => import("./components/ImageLightbox"));
const TheCarousel = dynamic(() => import("./components/TheCarousel"));
```

**잘 된 점:**

- 무거운 클라이언트 컴포넌트를 `next/dynamic`으로 지연 로딩
- 초기 번들 크기 감소에 기여

---

## 호출 흐름 시각화

```
페이지 요청 (예: /1.소개/1.의료진 소개)
    │
    ├─► TheHeader (Server Component)
    │       │
    │       ├─► Content (카테고리 1)
    │       │       ├─► getSlugsByCategoryAndSubCategory() × 3  [파일시스템 읽기]
    │       │       └─► getMdxContent() × 3                      [MDX 컴파일]
    │       │
    │       ├─► Content (카테고리 2)
    │       │       └─► ... (동일)
    │       │
    │       └─► Content (카테고리 3)
    │               └─► ... (동일)
    │
    ├─► AllCategoriesSheet (Server Component)
    │       └─► getMdxContent() × N                              [또 MDX 컴파일]
    │
    └─► Page Content
            ├─► getMdxContent()                                  [또 MDX 컴파일]
            └─► getPostContent()                                 [동적 import]
```

**결과:** 단일 페이지 요청에 **10~20번 이상의 MDX 컴파일** 발생 가능

---

## 🔧 개선 방안

| 우선순위 | 문제                             | 해결책                                                     |
| -------- | -------------------------------- | ---------------------------------------------------------- |
| **1**    | 매 요청마다 MDX 컴파일           | React `cache()` 함수로 `getMdxContent` 래핑                |
| **2**    | TheHeader에서 모든 카테고리 로드 | 네비게이션 데이터를 **빌드 타임에 JSON으로 생성**          |
| **3**    | 게시판 메타데이터 로딩           | 메타데이터를 **JSON 파일로 미리 생성** 또는 `cache()` 적용 |
| **4**    | 파일 시스템 반복 탐색            | `unstable_cache` 또는 빌드 타임 데이터 생성                |
| **5**    | 정적 페이지 동적 처리            | `generateStaticParams()` 활용해 빌드 타임에 정적 생성      |

---

## 즉시 적용 가능한 코드

### 1. React `cache()` 적용

```typescript
// lib/content.ts
import { cache } from "react";

export const getMdxContent = cache(async ({ category, subCategory, slug }) => {
  // 기존 로직 유지
  // 동일한 인자로 호출 시 캐시된 결과 반환
});
```

### 2. 네비게이션 데이터 분리

```typescript
// lib/navigation-data.ts
// 빌드 타임에 실행되는 스크립트로 JSON 생성
export const navigationData = {
  categories: [
    {
      name: "1.소개",
      subCategories: [
        { name: "1.의료진 소개", headings: ["h2-1", "h2-2"] },
        // ...
      ],
    },
  ],
};
```

### 3. TheHeader 최적화

```typescript
// TheHeader를 클라이언트 컴포넌트로 변경하고 데이터는 props로 전달
// 또는 빌드된 네비게이션 데이터를 import
import navigationData from "@/lib/navigation-data.json";
```

---

## 참고: 프로덕션 vs 개발 모드

| 환경         | MDX 처리           | 캐싱         |
| ------------ | ------------------ | ------------ |
| `pnpm dev`   | 매 요청마다 컴파일 | 없음 (HMR)   |
| `pnpm build` | 빌드 타임에 컴파일 | 정적 생성    |
| `pnpm start` | 빌드된 결과 사용   | ISR/SSG 캐시 |

**개발 모드에서 특히 느린 이유**:

- Turbopack/Webpack이 매번 MDX를 재컴파일
- React Server Components가 매 요청마다 실행
- 캐싱이 비활성화됨
