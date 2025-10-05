# Database Package

Neon DB와 Drizzle ORM을 사용하는 데이터베이스 패키지입니다.

## 설정

### 1. 환경 변수 설정

`.env` 파일을 생성하고 Neon DB 연결 URL을 설정합니다:

```bash
cp .env.example .env
```

그리고 `.env` 파일의 `DATABASE_URL`을 Neon 대시보드에서 가져온 실제 값으로 변경합니다.

### 2. 패키지 설치

```bash
pnpm install
```

## 사용 가능한 스크립트

### `pnpm db:generate`

스키마 변경사항을 기반으로 마이그레이션 파일을 생성합니다.

```bash
pnpm db:generate
```

### `pnpm db:migrate`

생성된 마이그레이션 파일을 데이터베이스에 적용합니다.

```bash
pnpm db:migrate
```

### `pnpm db:push`

개발 환경에서 스키마 변경사항을 즉시 데이터베이스에 푸시합니다 (마이그레이션 파일 생성 없이).

```bash
pnpm db:push
```

### `pnpm db:studio`

Drizzle Studio를 실행하여 브라우저에서 데이터베이스를 관리합니다.

```bash
pnpm db:studio
```

### `pnpm db:drop`

마이그레이션을 되돌립니다.

```bash
pnpm db:drop
```

## 스키마

### Tables

- **blocks**: 블록 기반 콘텐츠 관리
- **files**: 파일 메타데이터 관리
- **pages**: 페이지 관리
- **versions**: 버전 관리

자세한 스키마 정의는 `src/schema.ts`를 참고하세요.

## 다른 앱에서 사용하기

```typescript
import { db, blocksTable, pagesTable } from "db";

// 데이터 조회
const pages = await db.select().from(pagesTable);

// 데이터 삽입
await db.insert(pagesTable).values({
  id: "page-1",
  title: "My Page",
  status: "draft",
  spaceId: "space-1",
  authorId: "user-1",
});
```

## 개발 워크플로우

1. `src/schema.ts`에서 스키마 수정
2. `pnpm db:generate`로 마이그레이션 생성
3. `pnpm db:migrate`로 마이그레이션 적용
4. 또는 개발 중에는 `pnpm db:push`로 빠르게 테스트

## 참고

- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [Neon 문서](https://neon.tech/docs)
