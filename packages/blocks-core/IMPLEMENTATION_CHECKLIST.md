# 기본값 / Optional 전략 구현 체크리스트

## ✅ 완료된 항목

### 1. 각 블록 optional 필드 & 기본값 표 확정

- [x] paragraph: marks → `[]`
- [x] heading: level → `2` (H2 기본)
- [x] list: style → `"bullet"`
- [x] image: alt → `""`, caption → `""`
- [x] table: hasHeader → `false`
- [x] cta: description → `""`
- [x] section: variant → `"default"`, padding → `"md"`
- [x] embed: provider → URL에서 추론
- [x] info_card: icon/image → `undefined` (optional)
- [x] divider: 빈 객체
- [x] faq_item, accordion_group, columns: 필수 필드만

### 2. normalizeBlockTree() 구현 (서버 저장 훅)

- [x] 기본값 주입 로직 구현
- [x] order 자동 할당 (100, 200, 300...)
- [x] 중첩 구조 정규화
- [x] provider 자동 추론 (YouTube, Vimeo, Maps 등)
- [x] 타입 안전성 보장

### 3. 렌더러/에디터에서 기본값 주입 안 해도 되도록 보장

- [x] 저장 시점에 정규화 완료
- [x] DB에는 항상 완전한 데이터 저장
- [x] 클라이언트는 undefined 처리 불필요

### 4. heading H1 개수 제한 등 "문서 레벨 규칙" 별도 validator 여부 결정

- [x] 현재는 블록 레벨 검증만 구현
- [x] 문서 레벨 규칙은 별도 validator로 구현 가능
- [x] 필요시 `validateDocumentLevel` 함수 추가 가능

### 5. 문서화: "기본값 정책 변경 시 마이그레이션 절차"

- [x] README.md 업데이트 완료
- [x] 사용 예제 포함
- [x] 마이그레이션 전략 문서화

## 🎯 구현된 핵심 기능

### 정규화 시스템

```typescript
// 서버 액션에서 사용
const normalizedTree = normalizeBlockTree(rawBlockTree);
const validation = validateNormalizedTree(normalizedTree);
```

### 기본값 적용 예시

```typescript
// 정규화 전
{
  type: "heading",
  props: { text: "제목" } // level 누락
}

// 정규화 후
{
  type: "heading",
  props: { text: "제목", level: 2 } // 기본값 주입
}
```

### Provider 자동 추론

```typescript
// URL에서 자동으로 provider 추론
"https://youtube.com/watch?v=..." → provider: "youtube"
"https://maps.google.com/..." → provider: "map"
```

## 🚀 다음 단계

### 1. 렌더러 통합

- [ ] blocks-render-react 패키지에서 정규화된 데이터 사용
- [ ] undefined 체크 로직 제거
- [ ] 기본값 의존성 제거

### 2. 에디터 통합

- [ ] 블록 에디터에서 optional 필드 UI 개선
- [ ] 기본값 표시/편집 기능
- [ ] 실시간 유효성 검사

### 3. 마이그레이션 도구

- [ ] 기존 데이터 정규화 스크립트
- [ ] 버전 관리 시스템
- [ ] 롤백 기능

### 4. 고급 기능

- [ ] 문서 레벨 검증 규칙
- [ ] 커스텀 기본값 설정
- [ ] 조건부 기본값 (context 기반)

## 📊 테스트 결과

```bash
=== 정규화 전 유효성 검사 ===
유효: true

=== 정규화 후 블록 트리 ===
- heading level: 2 ✅
- paragraph marks: [] ✅
- list style: bullet ✅
- image alt: "" ✅
- section variant: default ✅
- embed provider: youtube ✅

=== 정규화 후 유효성 검사 ===
유효: true ✅
```

## ✅ 체크리스트 완료!

기본값 / Optional 전략이 성공적으로 구현되었습니다.

**다음 서브이슈로 진행 가능합니다!** 💪
