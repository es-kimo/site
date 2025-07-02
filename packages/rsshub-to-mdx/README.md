# RSShub to MDX Converter

Twitter 피드를 RSShub를 통해 가져와서 MDX 파일로 변환하는 패키지입니다.

## 🚀 빠른 시작

### 가장 간단한 방법들

```bash
# 1. pnpm 스크립트 사용 (가장 간단)
pnpm inspiration

# 2. 초간단 쉘 스크립트
./scripts/i.sh

# 3. 상세한 쉘 스크립트
./scripts/inspiration.sh
```

### 고급 옵션

```bash
# retweet 제외
pnpm inspiration:clean
./scripts/inspiration.sh --no-retweets

# 다른 사용자
./scripts/inspiration.sh --username other_user

# 커스텀 설정
./scripts/inspiration.sh --username other_user --no-retweets --output-dir ./custom/dir
```

## 📋 사용 가능한 명령어들

### pnpm 스크립트

```bash
pnpm inspiration          # 기본 실행 (retweet 포함)
pnpm inspiration:clean    # retweet 제외
pnpm inspiration:build    # 패키지만 빌드
```

### 쉘 스크립트

```bash
./scripts/i.sh                           # 가장 간단
./scripts/inspiration.sh                 # 기본 실행
./scripts/inspiration.sh --help          # 도움말
./scripts/inspiration.sh --no-retweets   # retweet 제외
```

### CLI 직접 사용

```bash
# 빌드 후 직접 실행
pnpm inspiration:build
node packages/rsshub-to-mdx/dist/cli.js ryurlah --output-dir ./apps/blog/content/inspiration
```

## 🔧 설정

- **Username**: `ryurlah` (기본값)
- **Output Directory**: `./apps/blog/content/inspiration`
- **RSShub URL**: `http://localhost:1200`
- **Include Retweets**: `true` (기본값)

## 📁 출력 형식

각 트윗은 다음과 같은 형식의 MDX 파일로 변환됩니다:

```markdown
export const metadata = {
"title": "Tweet title...",
"description": "Tweet content...",
"keywords": ["inspiration", "twitter", "social"],
"alternate": {
"canonical": "inspiration/filename"
},
"other": {
"status": "ready",
"createdAt": "2025-06-19T21:10:43.000Z",
"originalLink": "https://x.com/ryurlah/status/...",
"author": "Kihyun Ryu"
}
};

# Tweet title

<PostDate>2025-06-19T21:10:43.000Z</PostDate>

Tweet content...

---

<div className="mt-4 text-sm text-gray-500">
  **Author:** Kihyun Ryu  
  **Original:** [View on Twitter](https://x.com/...)  
  **Published:** Jun 20, 2025, 6:10:43 AM
</div>
```

## ✨ 특징

- ✅ 중복 파일 자동 방지
- ✅ HTML 태그 자동 정리
- ✅ 날짜-제목 기반 파일명 생성
- ✅ 기존 블로그 형식과 100% 호환
- ✅ 컬러풀한 CLI 출력
- ✅ 다양한 실행 방법 제공

## 🛠️ 개발

```bash
cd packages/rsshub-to-mdx
pnpm install
pnpm build
```
