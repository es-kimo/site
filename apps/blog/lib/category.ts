/**
 * 카테고리 폴더 이름을 화면에 보여줄 이름으로 바꾼다.
 * 폴더 이름이 곧 URL 세그먼트라서 띄어쓰기를 하이픈으로 적고("Computer-Science"),
 * 표시할 때만 다시 공백으로 되돌린다.
 */
export const formatCategoryLabel = (category: string) => category.replace(/-/g, " ");
