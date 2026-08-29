import Link from "next/link";

interface SeriesNavProps {
  currentPart: number;
}

const SERIES_ITEMS = [
  {
    part: 1,
    title: "1단계: 백분위수와 K-익명성",
    subtitle: "이 기록은 전국에서 상위 몇 %일까?",
    slug: "percentile-and-k-anonymity",
  },
  {
    part: 2,
    title: "2단계: 코호트 생존분석과 잔존율",
    subtitle: "초등학생 때 1등 하던 아이들은 나중에 어떻게 될까?",
    slug: "cohort-survival-analysis",
  },
  {
    part: 3,
    title: "3단계: 공백 복귀율과 Stop Rule",
    subtitle: "선수가 1년 동안 대회에 안 나오면 은퇴일까, 휴식일까?",
    slug: "gap-return-rates-and-stop-rule",
  },
  {
    part: 4,
    title: "4단계: TrueSkill 베이지안 레이팅",
    subtitle: "체스의 Elo나 Glicko-2 대신 왜 TrueSkill일까?",
    slug: "trueskill-bayesian-rating",
  },
];

export function SeriesNav({ currentPart }: SeriesNavProps) {
  const prev = SERIES_ITEMS.find((item) => item.part === currentPart - 1);
  const next = SERIES_ITEMS.find((item) => item.part === currentPart + 1);

  return (
    <div className="my-10 rounded-xl border bg-muted/40 p-6 space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <span className="font-semibold text-sm tracking-wide text-foreground/90 flex items-center gap-2">
          📚 <span className="text-primary font-bold">splits</span> 통계 및 데이터 분석 시리즈 (총 4편)
        </span>
        <span className="text-xs text-muted-foreground font-mono">Part {currentPart} / 4</span>
      </div>

      <ol className="space-y-2 text-sm">
        {SERIES_ITEMS.map((item) => {
          const isCurrent = item.part === currentPart;
          return (
            <li key={item.part} className="flex items-start gap-2">
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${isCurrent ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground bg-muted"}`}>
                0{item.part}
              </span>
              {isCurrent ? (
                <span className="font-semibold text-foreground">
                  {item.title} — <span className="text-muted-foreground font-normal">{item.subtitle}</span>
                </span>
              ) : (
                <Link
                  href={`/writing/Data/${item.slug}`}
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  {item.title} — <span>{item.subtitle}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex items-center justify-between pt-3 border-t text-sm">
        {prev ? (
          <Link
            href={`/writing/Data/${prev.slug}`}
            className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
          >
            ← 이전 편 ({prev.title})
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/writing/Data/${next.slug}`}
            className="text-primary hover:underline inline-flex items-center gap-1 font-medium ml-auto"
          >
            다음 편 ({next.title}) →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
