---
description: 블로그 포스트 및 기술 문서 작성 시 준수해야 할 한국어 문체 및 마크다운 규칙
globs:
  - "apps/blog/content/**/*.mdx"
  - "docs/**/*.md"
---

# 기술 블로그 및 문서 작성 규칙 (Writing Style Rules)

모든 블로그 포스트(`apps/blog/content/**/*.mdx`)와 문서(`docs/**/*.md`)를 작성하거나 수정할 때는 반드시 [docs/writing-style-guide.md](file:///Users/kihyun/orgs/personal/site/docs/writing-style-guide.md)의 가이드라인을 엄격히 준수해야 합니다.

## 🚨 최우선 마크다운 렌더링 규칙: 볼드와 괄호 충돌 절대 금지!

CommonMark 파서의 right-flanking punctuation 처리 버그로 인해, **닫는 볼드(`**`) 바로 안쪽에 괄호가 들어가고 뒤에 한글 조사가 붙으면 볼드가 깨지고 `**` 기호가 그대로 화면에 노출**됩니다.

- ❌ **절대 금지 (화면에 `**` 그대로 노출됨)**:
  - `**경계(Boundary)**를`
  - `**추상화 수준(Level of Abstraction)**에`
  - `**순서(인덱스)**로`
- ⭕ **올바른 작성 방법 (평문 작성 또는 괄호 분리)**:
  - `Server Component와 Client Component 사이의 경계(Boundary)를` (평문 권장)
  - `추상화 수준(Level of Abstraction)에` (평문 권장)
  - `**경계** (Boundary)를` (볼드 바깥으로 괄호 분리)

---

## 🚫 지양해야 할 핵심 AI 문체

1. **가르치려는 훈계조 및 비장한 수사 금지**:
   - ❌ `~를 둔 진짜 이유는 ~하기 위함이었습니다`
   - ⭕ `~ 덕분에, 개발자는 ~할 수 있습니다.` (담백한 결과 서술)
2. **자극적 유튜브식 제목 및 모호한 제목 금지**:
   - ❌ `~의 정체`, `~의 대참사`, `다시 실행되는 범위는 누가 정하는가`
   - ⭕ `~의 동작 원리`, `React 리렌더링 범위는 어떻게 결정될까`
3. **뻔한 유도문 및 인위적 반전 금지**:
   - ❌ `처음에는 ~하기 쉽지만, 알고 나면...`
   - ⭕ 기술적 배경과 동작 원리로 바로 직결
4. **기계적인 '정리하며 / 요약' 섹션 의무화 금지**:
   - 모든 글 끝에 관성적으로 3줄 요약 섹션을 넣지 말고, 실무 해결책이나 본문 흐름에서 자연스럽게 완결
5. **감정적·과장된 어휘 금지**:
   - ❌ `가차 없이`, `놀랍게도`, `거의 공짜`, `단 한 줄도`
6. **영문식 대시(`—`) 및 문장 끝 콜론(`:`) 남발 금지**
7. **Mermaid 다이어그램은 반드시 `flowchart TD` 세로 스택 배치**

상세 규칙과 대조표는 [docs/writing-style-guide.md](file:///Users/kihyun/orgs/personal/site/docs/writing-style-guide.md)를 참조하세요.
