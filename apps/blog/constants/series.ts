export type SeriesItem = {
  part: number;
  title: string;
  subtitle: string;
  slug: string;
};

export const SERIES_CATEGORY = "Data";

export const SPLITS_URL = "https://splits.kr";

export const SERIES_ITEMS: SeriesItem[] = [
  {
    part: 1,
    title: "백분위수와 K-익명성",
    subtitle: "이 기록은 전국에서 상위 몇 %일까?",
    slug: "percentile-and-k-anonymity",
  },
  {
    part: 2,
    title: "코호트 생존분석과 잔존율",
    subtitle: "초등학생 때 1등 하던 아이들은 나중에 어떻게 될까?",
    slug: "cohort-survival-analysis",
  },
  {
    part: 3,
    title: "공백 복귀율과 Stop Rule",
    subtitle: "선수가 1년 동안 대회에 안 나오면 은퇴일까, 휴식일까?",
    slug: "gap-return-rates-and-stop-rule",
  },
  {
    part: 4,
    title: "TrueSkill 베이지안 레이팅",
    subtitle: "체스의 Elo나 Glicko-2 대신 왜 TrueSkill일까?",
    slug: "trueskill-bayesian-rating",
  },
];

export const seriesHref = (slug: string) => `/writing/${SERIES_CATEGORY}/${slug}`;

export const seriesTitle = ({ part, title }: SeriesItem) => `${part}단계: ${title}`;

/** 글이 시리즈에 속하면 몇 번째인지 알려준다. 글 푸터가 시리즈 목록을 붙일지 판단하는 데 쓴다. */
export const findSeriesPart = (category: string, slug: string): number | null => {
  if (category !== SERIES_CATEGORY) return null;
  return SERIES_ITEMS.find((item) => item.slug === slug)?.part ?? null;
};
