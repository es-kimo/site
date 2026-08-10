# yjshd 페이지 로딩 성능 병목 분석

> 분석일: 2026-01-27
> 재점검: 2026-08-10

---

## 📌 2026-08-10 재점검 결과

아래 1월 분석 중 일부는 **이미 해결되었고, 일부는 사실과 달랐습니다.** 현재 상태는 다음과 같습니다.

| 1월 지적 항목                    | 현재 상태                                                                  |
| -------------------------------- | -------------------------------------------------------------------------- |
| `getMdxContent` 캐싱 없음        | ✅ 해결됨 — `lib/content.ts`가 React `cache()`로 감싸져 있음                |
| TheHeader에서 MDX 반복 컴파일    | ✅ 해결됨 — `lib/navigation-data.json`을 prebuild로 생성해 import           |
| AllCategoriesSheet 동일 문제     | ✅ 해결됨 — 위와 동일                                                       |
| `generateStaticParams()` 미적용  | ✅ 이번에 해결 — 7개 → **167개** 페이지 프리렌더                            |
| 게시판 메타데이터 매 요청 import | ⬜ 미해결 — 47개 글을 여전히 요청마다 동적 import                           |
| structure.ts top-level await     | ⬜ 미해결                                                                   |

### 1월 분석이 놓쳤던 것

**1. 웹폰트 18개 URL이 전부 404였습니다.**

`packages/ui/src/styles/fonts.css`가 구글이 폐기한 legacy early-access(`/ea/`) 경로를 참조했습니다.
6개 weight × 3개 포맷 = 18개 요청이 모두 404. 즉 사이트는 한 번도 Noto Sans KR로 렌더링된 적이 없고,
줄곧 시스템 폰트로 폴백되고 있었습니다. 게다가 `globals.css`가 `@import url("fonts.css")`로 불러서
`HTML → globals.css → fonts.css → 폰트` 요청 체인이 한 단계 더 깊었고, preconnect도 없었습니다.

→ `fonts.css` 삭제, `@import` 제거로 해결. 웹폰트 도입 여부는 [README.md](./README.md)의 측정 비교 참고.

**2. `fontFamily`가 어디에도 정의되어 있지 않았습니다.**

blog 앱은 `next/font/google`로 `--font-noto-sans-kr` 변수를 만들지만,
tailwind 설정에 `fontFamily` 매핑이 없어 그 변수를 **아무도 소비하지 않았습니다.**
blog 역시 실제로는 시스템 폰트로 렌더링되고 있었습니다.

**3. `dynamicParams = false`가 무의미하게 걸려 있었습니다.**

`generateStaticParams` 없이 `dynamicParams = false`만 export되어 있어 아무 효과가 없었습니다.
`packages/common/src/structure/params.ts`에 `categoryParams` / `subCategoryParams` / `slugParams`가
완성된 채로 **어디에서도 쓰이지 않고** 있었습니다.

**4. `(dynamic)` 라우트와의 경로 충돌.**

`generateStaticParams`를 그냥 붙이면 `/4.게시판`, `/3.강좌/2.콩팥질환 정보` 등
`app/(dynamic)`의 전용 페이지와 경로가 겹쳐 `ENOENT: content/3.강좌/2.콩팥질환 정보/page.mdx`로
빌드가 실패합니다. `lib/static-params.ts`가 `app/(dynamic)`을 훑어 해당 경로를 제외합니다.
목록을 하드코딩하지 않으므로 `(dynamic)`에 페이지를 추가해도 빌드가 깨지지 않습니다.

### 남은 과제 (영향도 순)

1. **콘텐츠 이미지 160MB / 131장** (평균 1.2MB, 최대 3.5MB) — 리사이즈 + 사전 webp 변환 필요.
   `public/`도 `drawing.png` 2.7MB, `clinic-marker.png` 2.4MB로 과대합니다.
2. **LCP 이미지에 `priority` 없음** — 홈의 `mission.png`가 `loading="lazy"`,
   `/1.소개/3.연세정성내과 소개`는 이미지 84장이 전부 lazy입니다.
3. **YouTube 임베드가 lazy 없이 로드** — `<Video>` 하나가 서드파티 1,080KB를 끌어옵니다
   (youtube / doubleclick / ytimg). `loading="lazy"` 또는 파사드 패턴 권장.
4. **게시판 47개 글 메타데이터를 매 요청 동적 import** — Next 16 `cacheComponents` + `use cache`로
   정적 셸 분리 가능. (16.0.10에서 `cacheComponents`, `cacheLife`, `useCache` 지원 확인함)
5. **`metadataBase` 미설정** — OG 이미지가 `localhost:3000`으로 해석됩니다 (빌드 경고).

---

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
