# site

개인 블로그 등 웹사이트를 관리하는 모노레포입니다.

## Apps

### blog

프론트엔드 기술 블로그입니다. MDX로 글을 작성하고, Sandpack 기반의 인터랙티브 코드 플레이그라운드를 지원합니다.

- https://khryu.dev

### yjshd

웹사이트입니다. CLI를 통해 콘텐츠를 작성·게시할 수 있도록 만들었습니다.

## Packages

| 패키지              | 설명                                                                |
| ------------------- | ------------------------------------------------------------------- |
| `ui`                | Radix UI 기반 공유 컴포넌트 라이브러리                              |
| `common`            | 두 앱에서 공통으로 사용하는 유틸리티                                |
| `mdx-cli`           | MDX 콘텐츠 생성 CLI. 인터랙티브 프롬프트로 글 작성을 안내           |
| `resume`            | YAML로 작성한 이력서를 Markdown, JSON Resume, JSON-LD 포맷으로 변환 |
| `eslint-config`     | 공유 ESLint 설정                                                    |
| `typescript-config` | 공유 TypeScript 설정                                                |

## Setup

```bash
pnpm install
pnpm dev
```

## License

MIT
