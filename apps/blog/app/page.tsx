import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-2xl">
        <article className="font-[family-name:var(--font-stix)] space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            I&apos;m a frontend developer with a strong interest in user interaction and tooling. I enjoy working on features where small design decisions meaningfully improve how people work.
            I&apos;m still early in my career, but I care deeply about clarity, predictability, and reducing unnecessary complexity.
          </p>
          <p>
            Recently, I&apos;ve been spending more time thinking about system design from a frontend perspective. I&apos;m learning backend fundamentals — HTTP, API design, and server-side state — not
            to become a backend developer, but to better define frontend responsibilities. In 2026, my goal is to design clearer boundaries between client and server, and make more intentional
            decisions about where complexity should live.
          </p>

          <div className="pt-12 mt-4">
            <Link
              href="/Resume_v1.2.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-baseline gap-1.5 text-[17px] text-foreground/80 hover:text-foreground transition-colors duration-200"
            >
              <span className="relative">
                View resume
                <span className="absolute -bottom-0.5 left-0 w-full h-px bg-foreground/20 group-hover:bg-foreground/40 transition-colors duration-200" />
              </span>
              <span className="text-foreground/40 group-hover:text-foreground/60 transition-all duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
