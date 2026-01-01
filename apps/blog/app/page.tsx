export default function HomePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
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
        </article>
      </div>
    </div>
  );
}
