// =============================================================================
// /resume 페이지를 Puppeteer로 캡처하여 PDF 생성
// 사용: pnpm --filter @workspace/resume pdf
//   ↳ 기본적으로 http://localhost:3000/resume 를 캡처합니다.
//   ↳ 환경변수 RESUME_URL 로 URL을 변경할 수 있습니다.
// =============================================================================

import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../dist");
const BLOG_PUBLIC = resolve(__dirname, "../../../apps/blog/public");

const RESUME_URL = process.env.RESUME_URL ?? "http://localhost:3000/resume";

async function main() {
  console.log(`⏳ Launching browser…`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Emulate print media for @media print styles
  await page.emulateMediaType("print");

  console.log(`⏳ Loading ${RESUME_URL}…`);
  await page.goto(RESUME_URL, { waitUntil: "networkidle0", timeout: 30_000 });

  // Wait a bit for fonts to load
  await page.evaluate(() => document.fonts.ready);

  mkdirSync(OUT_DIR, { recursive: true });

  const pdfPath = resolve(OUT_DIR, "resume.pdf");
  await page.pdf({
    path: pdfPath,
    format: "A4",
    margin: { top: "15mm", right: "18mm", bottom: "15mm", left: "18mm" },
    printBackground: true,
    preferCSSPageSize: false,
  });

  console.log(`✓ dist/resume.pdf`);

  // Copy to blog public/ for web download
  if (existsSync(BLOG_PUBLIC)) {
    copyFileSync(pdfPath, resolve(BLOG_PUBLIC, "resume.pdf"));
    console.log(`✓ apps/blog/public/resume.pdf (web download)`);
  }

  await browser.close();
  console.log(`\nDone! PDF generated.`);
}

main().catch((err) => {
  console.error("❌ PDF generation failed:", err.message);
  console.error("\n💡 dev 서버가 실행 중인지 확인하세요:");
  console.error("   pnpm --filter blog dev");
  process.exit(1);
});
