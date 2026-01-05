import { getLanguage, type Language } from "@/lib/language";
import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";

const content = {
  ko: {
    intro1:
      "저는 사용자 인터랙션과 도구 개발에 관심이 많은 프론트엔드 개발자입니다. 작은 디자인 결정이 사람들의 작업 방식을 의미 있게 개선하는 기능을 만드는 것을 좋아합니다. 아직 커리어 초기이지만, 명확성, 예측 가능성, 그리고 불필요한 복잡성을 줄이는 것을 중요하게 생각합니다.",
    intro2:
      "최근에는 프론트엔드 관점에서 시스템 설계에 대해 더 많은 시간을 할애하고 있습니다. HTTP, API 설계, 서버 사이드 상태 등 백엔드 기초를 배우고 있습니다. 백엔드 개발자가 되기 위해서가 아니라, 프론트엔드의 책임을 더 명확하게 정의하기 위해서입니다. 2026년의 목표는 클라이언트와 서버 간의 경계를 더 명확하게 설계하고, 복잡성이 어디에 있어야 하는지에 대해 더 의도적인 결정을 내리는 것입니다.",
  },
  en: {
    intro1:
      "I'm a frontend developer with a strong interest in user interaction and tooling. I enjoy working on features where small design decisions meaningfully improve how people work. I'm still early in my career, but I care deeply about clarity, predictability, and reducing unnecessary complexity.",
    intro2:
      "Recently, I've been spending more time thinking about system design from a frontend perspective. I'm learning backend fundamentals — HTTP, API design, and server-side state — not to become a backend developer, but to better define frontend responsibilities. In 2026, my goal is to design clearer boundaries between client and server, and make more intentional decisions about where complexity should live.",
  },
} satisfies Record<Language, { intro1: string; intro2: string }>;

export const InlineLink = ({ children, ...props }: React.ComponentProps<typeof Link>) => {
  return (
    <Link className="underline-offset-2 underline" {...props}>
      {children}
    </Link>
  );
};

export default async function HomePage() {
  const language = await getLanguage();
  const t = content[language];

  return (
    <div className="flex items-center justify-center px-6 sm:px-16 sm:mt-16">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-stix)] mb-4">khryu.dev</h1>
        <article
          style={{ viewTransitionName: "home-content" }}
          className={cn(
            language === "ko" ? "font-[family-name:var(--font-noto-sans-kr)] text-base" : "font-[family-name:var(--font-stix)] text-[17px]",
            "space-y-6 leading-relaxed text-foreground/90"
          )}
        >
          <p>{t.intro1}</p>
          <p>{t.intro2}</p>
          <p>
            {language === "ko" ? (
              <>
                <InlineLink href="/writing">글</InlineLink>
                이나{" "}
                <InlineLink href="/Resume_v1.2.pdf" target="_blank" rel="noopener noreferrer">
                  이력서
                </InlineLink>
                , 혹은{" "}
                <InlineLink href="https://x.com/ryurlah" target="_blank" rel="noopener noreferrer">
                  X
                </InlineLink>
                를 통해 저의 활동을 더 알아보실 수 있습니다.
              </>
            ) : (
              <>
                You can read my <InlineLink href="/writing">writing</InlineLink> or{" "}
                <InlineLink href="/Resume_v1.2.pdf" target="_blank" rel="noopener noreferrer">
                  resume
                </InlineLink>
                , or{" "}
                <InlineLink href="https://x.com/ryurlah" target="_blank" rel="noopener noreferrer">
                  follow me on X
                </InlineLink>
                .
              </>
            )}
          </p>
        </article>
      </div>
    </div>
  );
}
