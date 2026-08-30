# Repository Guidelines for Antigravity

이 저장소의 기술 블로그 글(`apps/blog/content/`) 및 문서(`docs/`)를 작성하거나 수정할 때는 다음 규칙을 최우선으로 준수해야 합니다.

## 1. 마크다운 렌더링 절대 규칙: 볼드와 괄호 결합 금지
- ❌ `**단어(영어)**에` $\to$ 파서 오류로 인해 화면에 `**` 기호가 그대로 노출됩니다.
- ⭕ `단어(영어)에` 또는 `**단어** (영어)에` 처럼 작성하세요.

## 2. 글 작성 스타일 가이드 준수
- 블로그 글 작성 시 반드시 [docs/writing-style-guide.md](file:///Users/kihyun/orgs/personal/site/docs/writing-style-guide.md)의 규칙을 따릅니다.
- 훈계조 서술(`~한 진짜 이유는 ~하기 위함이었습니다`), 유튜브식 자극적 제목, 뻔한 유도문, 기계적인 '정리하며' 3줄 요약 섹션 등을 엄격히 금지합니다.
- Mermaid 다이어그램은 화면 폭에 따라 글씨가 작아지지 않도록 반드시 `flowchart TD` 세로 스택(Top-Down) 구조로 작성합니다.
