# 연세정성내과 웹사이트 글 작성 가이드

이 가이드는 연세정성내과 웹사이트에 글을 작성하는 방법을 설명합니다. 프로그래밍 지식이 없어도 쉽게 따라할 수 있습니다.

## 시작하기 전에 알아두세요!

- 이 가이드는 Windows와 Mac 컴퓨터 모두에서 사용할 수 있습니다.
- 모든 설치 과정은 약 15-20분 정도 소요됩니다.
- 설치 중 어려움이 있다면 언제든 관리자에게 문의해주세요.

## 필요한 프로그램 설치하기

컴퓨터에 다음 프로그램들을 순서대로 설치해주세요:

### 1. Node.js 설치하기

1. [Node.js 공식 웹사이트](https://nodejs.org/)에 접속합니다.
2. 왼쪽에 있는 "LTS" 버전 다운로드 버튼을 클릭합니다.
   - LTS는 "장기 지원 버전"이라는 뜻으로, 가장 안정적인 버전입니다.
3. 다운로드된 설치 파일을 실행합니다.
4. 설치 과정에서 나오는 모든 항목에 대해 '다음(Next)' 버튼을 클릭하시면 됩니다.
   - 특별히 변경할 설정은 없습니다.

### 2. VS Code(비주얼 스튜디오 코드) 설치하기

1. [VS Code 공식 웹사이트](https://code.visualstudio.com/)에 접속합니다.
2. 파란색 다운로드 버튼을 클릭합니다.
3. 다운로드된 설치 파일을 실행합니다.
4. 설치 과정에서 나오는 모든 항목에 '다음(Next)' 버튼을 클릭하시면 됩니다.
   - "Code로 열기" 항목이 나오면 체크해주세요.

### 3. Git 설치하기

1. [Git 공식 웹사이트](https://git-scm.com/)에 접속합니다.
2. 오른쪽에 있는 "Download for Windows/Mac" 버튼을 클릭합니다.
3. 다운로드된 설치 파일을 실행합니다.
4. 설치 과정에서 나오는 모든 항목에 '다음(Next)' 버튼을 클릭하시면 됩니다.
   - 특별히 변경할 설정은 없습니다.

## VS Code로 프로젝트 시작하기

### 1. VS Code 실행하기

- Windows: 시작 메뉴에서 "Visual Studio Code" 검색
- Mac: Launchpad에서 "Visual Studio Code" 검색

### 2. 프로젝트 폴더 열기

1. VS Code 메뉴에서 "파일(File)" > "폴더 열기(Open Folder)" 선택
2. 관리자가 알려준 프로젝트 폴더를 선택합니다.

### 3. 터미널 열기

1. VS Code 상단 메뉴에서 "터미널(Terminal)" > "새 터미널(New Terminal)" 선택
   - Windows 단축키: Ctrl + `
   - Mac 단축키: Command + `
2. 아래쪽에 검은색 창(터미널)이 나타납니다.
3. 터미널에 다음 명령어를 입력하고 Enter 키를 누릅니다:
   ```bash
   pnpm install
   ```
4. 설치가 완료될 때까지 기다려주세요. (약 1-2분 소요)

## 글 작성하기

### 1. 게시판에 글 쓰기

1. VS Code 터미널에서 다음 명령어를 입력하고 Enter 키를 누릅니다:
   ```bash
   pnpm 게시판
   ```
2. 순서대로 정보를 입력해주세요:
   - 페이지 제목 입력 후 Enter
     - 예시: "3월 진료 시간 안내"
   - 페이지 설명 입력 후 Enter (선택사항)
     - 예시: "3월 연휴 기간 진료 시간 안내입니다."
   - 키워드 입력 후 Enter (선택사항)
     - 예시: "진료시간, 연휴, 공지"
   - 공지글 여부 선택
     - 화살표 키(↑↓)로 선택 후 Enter

### 2. 콩팥질환 정보 글 쓰기

1. VS Code 터미널에서 다음 명령어를 입력하고 Enter 키를 누릅니다:
   ```bash
   pnpm 콩팥질환정보
   ```
2. 순서대로 정보를 입력해주세요:
   - 페이지 제목 입력 후 Enter
     - 예시: "만성 콩팥병의 이해"
   - 페이지 설명 입력 후 Enter (선택사항)
     - 예시: "만성 콩팥병의 원인과 증상에 대해 알아봅니다."
   - 키워드 입력 후 Enter (선택사항)
     - 예시: "만성콩팥병, 신장질환, 증상"

### 3. 글 저장하고 게시하기

1. 글 작성이 완료되면 터미널에서 다음 명령어를 입력하고 Enter 키를 누릅니다:
   ```bash
   pnpm 게시
   ```
2. 글이 성공적으로 게시될 때까지 기다려주세요. (약 1분 소요)

## 글 꾸미기 가이드

MDX 파일에서 사용할 수 있는 특별한 기능들을 소개합니다.
아래 예시들을 복사해서 사용하시면 됩니다.

### 1. 기본 텍스트 꾸미기

```typescript
# 큰 제목

## 중간 제목

### 작은 제목

일반 텍스트는 그냥 작성하면 됩니다.

**굵은 글씨로 강조하기**
_기울임 글씨로 강조하기_

- 목록 첫 번째
- 목록 두 번째
  - 들여쓰기된 목록

1. 번호가 있는 목록 1
2. 번호가 있는 목록 2
```

### 2. 특별한 기능들

#### 이미지 사용하기 (상세 가이드)

##### 1️⃣ 이미지 준비하기

- 이미지 파일 형식은 PNG를 권장합니다.
  - PNG는 깔끔한 화질을 유지하면서도 적절한 용량을 가집니다.
  - JPG나 JPEG도 사용 가능하지만, 글자나 로고가 있는 이미지는 PNG가 더 선명합니다.

##### 2️⃣ 이미지 파일 저장하기

1. 이미지는 글이 있는 폴더에 직접 저장합니다.

   예시:

   ```
   3.콩팥질환 강좌/
     2.콩팥질환 정보/
       혈액투석 환자가 꼭 지켜야 할 4가지/
         page.mdx
         image.png
   ```

2. 파일 이름 규칙:
   - 단일 이미지: `image.png`
   - 여러 이미지가 필요한 경우:
     - 일반적인 경우: `image1.png`, `image2.png` 등의 순번
     - 특별한 구분이 필요한 경우: `profile.png`, `resume.png`와 같이 의미있는 이름 사용
   - 이미지가 정말 많은 경우에만 하위 폴더 `img` 사용 (예: `img/2020_개원/`, `img/2022_발돋움/`)
     - 하위 폴더의 이름은 반드시 `img`여야합니다.

##### 3️⃣ mdx 파일에서 이미지 사용하기 (기본)

```typescript
// 단일 이미지인 경우
import image from "./image.png";

// 여러 이미지인 경우
import image1 from "./image1.png";
import image2 from "./image2.png";

// 이미지 표시하기
<Image src={image} alt="이미지 설명" />
```

##### 4️⃣ 이미지 크기 조절하기

```typescript
// 1. 기본 크기 (대부분의 경우 이것 사용)
<Image src={image} alt="이미지 설명" size="default" />

// 2. 전체 너비 사용
<Image src={image} alt="이미지 설명" size="full" />

// 3. 작은 크기 (아이콘이나 작은 이미지)
<Image src={image} alt="이미지 설명" size="xs" />

// 4. 아이콘 크기
<Image src={image} alt="이미지 설명" size="icon" />

// 5. 정사각형 (프로필 사진 등)
<Image src={image} alt="이미지 설명" size="square" />
```

##### 5️⃣ 여러 이미지 나란히 보여주기

```typescript
// 이미지 그리드로 보여주기 (클릭하면 크게 볼 수 있음)
<ImageLightbox grid={4} title="2025 외래">
  <ImageWithoutLightbox src={image1} alt="첫 번째 이미지" size="full" />
  <ImageWithoutLightbox src={image2} alt="두 번째 이미지" size="full" />
  <ImageWithoutLightbox src={image3} alt="세 번째 이미지" size="full" />
  <ImageWithoutLightbox src={image4} alt="네 번째 이미지" size="full" />
</ImageLightbox>

// grid 속성으로 한 줄에 보여줄 이미지 개수 조절
// - grid={2}: 2개씩 보여주기
// - grid={3}: 3개씩 보여주기
// - grid={4}: 4개씩 보여주기 (기본값)
```

##### 6️⃣ 이미지 슬라이드 만들기

```typescript
<Carousel>
  <ImageWithoutLightbox src={image1} alt="첫 번째 이미지" />
  <ImageWithoutLightbox src={image2} alt="두 번째 이미지" />
  <ImageWithoutLightbox src={image3} alt="세 번째 이미지" />
</Carousel>
```

##### ⚠️ 자주 하는 실수와 해결 방법

1. 이미지가 보이지 않을 때

   - import 구문이 정확한지 확인
   - 파일 이름이 정확한지 확인
   - 파일이 올바른 폴더에 있는지 확인

2. 이미지가 너무 크거나 작을 때

   - `size` 속성을 다르게 시도해보기
   - 원본 이미지 크기 확인

3. 이미지가 흐릿할 때
   - PNG 형식으로 저장했는지 확인
   - 원본 이미지 해상도 확인

##### 💡 유용한 팁

1. 이미지 설명은 구체적으로 작성해주세요.

   ```typescript
   // 좋은 예시
   <Image src={image} alt="2024년 3월 첫째 주 진료 시간표" />

   // 나쁜 예시
   <Image src={image} alt="시간표" />
   ```

2. 이미지 파일명은 용도에 맞게 작성해주세요.
   ```
   단일 이미지: image.png
   여러 이미지: image1.png, image2.png
   특별한 용도: profile.png, resume.png
   ```

### 3. 텍스트 스타일 꾸미기

```typescript
<Lead>큰 글씨로 중요한 내용을 표시할 때 사용합니다.</Lead>

<Large>중간 크기의 굵은 글씨로 표시됩니다.</Large>

<Small>작은 글씨로 부가 설명을 할 때 사용합니다.</Small>

<Muted>흐린 색상의 작은 글씨로 덜 중요한 내용을 표시할 때 사용합니다.</Muted>
```

### 4. 추가 컴포넌트 사용하기

#### 용어와 설명 목록 만들기

용어와 그에 대한 설명을 깔끔하게 정리할 때 사용합니다.

```typescript
<DescriptionList>
  <DescriptionRow>
    <DescriptionTerm>용어</DescriptionTerm>
    <DescriptionDetails>용어에 대한 자세한 설명을 여기에 적습니다.</DescriptionDetails>
  </DescriptionRow>
  <DescriptionRow>
    <DescriptionTerm>다른 용어</DescriptionTerm>
    <DescriptionDetails>다른 설명을 여기에 적습니다.</DescriptionDetails>
  </DescriptionRow>
</DescriptionList>
```

#### 유튜브 영상 넣기

유튜브 영상을 페이지에 삽입할 때 사용합니다.

```typescript
<Video src="https://www.youtube.com/embed/영상ID" />
```

영상 주소 가져오는 방법:

1. 유튜브 영상 페이지에서 '공유' 버튼 클릭
2. '퍼가기' 탭 선택
3. iframe 코드 확인
4. src="..." 부분의 주소를 복사해서 사용

예시:

```html
<!-- 유튜브에서 제공하는 iframe 코드 -->
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/abcd1234"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
></iframe>

<!-- 우리 사이트에서 사용할 코드 -->
<video src="https://www.youtube.com/embed/abcd1234" />
```

#### 네이버 지도 넣기

병원 위치 등을 보여줄 때 사용합니다.

```typescript
<NaverMap zoom={15} width="100%" />
```

- `zoom`: 지도 확대/축소 레벨 (1-20 사이 선택)
  - 숫자가 클수록 더 자세히 보입니다.
  - 15: 건물 수준으로 보기 좋은 크기
  - 17: 건물 내부가 자세히 보이는 크기

#### 중요한 내용 강조하기

특별히 강조하고 싶은 내용이 있을 때 사용합니다.

```typescript
<Callout>
  중요한 내용을 여기에 적으면 강조되어 보입니다.
  여러 줄도 가능합니다.
</Callout>
```

#### 작성일 표시하기

글의 작성 날짜를 표시할 때 사용합니다.

```typescript
<PostDate>2024-03-28T23:00:00</PostDate>
```

- 날짜 형식: `YYYY-MM-DDThh:mm:ss`
- 시간대는 한국 시간(KST)을 기준으로 합니다.

## 자주 발생하는 문제와 해결 방법

### 1. 프로그램이 설치되지 않을 때

- 컴퓨터를 재시작한 후 다시 시도해보세요.
- 관리자 권한으로 설치를 시도해보세요.
  - 설치 파일을 우클릭하고 "관리자 권한으로 실행" 선택

### 2. 명령어가 실행되지 않을 때

- VS Code를 완전히 종료했다가 다시 실행해보세요.
- 터미널에서 `pnpm install`을 다시 실행해보세요.

### 3. 이미지가 보이지 않을 때

- 이미지 파일 이름이 정확한지 확인해주세요.
- 이미지 파일 확장자(.jpg, .png 등)가 정확한지 확인해주세요.

## 주의사항

1. 제목에는 물음표(?)를 사용할 수 없습니다.
2. 이미지에는 항상 설명(alt)을 포함해주세요.
3. 작업 중 문제가 발생하면 바로 관리자에게 문의해주세요.

## 도움이 필요하신가요?

이 가이드를 따라하시다가 어려움이 있으시다면:

1. 문제가 발생한 화면을 캡처해주세요.
2. 어떤 단계에서 문제가 발생했는지 메모해주세요.
3. 관리자에게 연락주시면 친절히 도와드리겠습니다.
