import { fetchRSSFeed, parseRSSXML, extractTweetItems } from "./parser";
import { createSlug, generateMDXMetadata, generateMDXContent } from "./converter";
import { saveMDXFile, fileExists } from "./fileSystem";
import type { ConvertOptions } from "./types";

export async function convertRSSToMDX(options: ConvertOptions): Promise<void> {
  console.log("Fetching RSS feed...");
  const xmlString = await fetchRSSFeed(options);

  console.log("Parsing XML...");
  const feed = await parseRSSXML(xmlString);

  console.log("Extracting tweet items...");
  const items = extractTweetItems(feed);

  console.log(`Found ${items.length} tweets to convert`);

  const results = [];

  for (const item of items) {
    const slug = createSlug(item.title, item.pubDate);
    const filePath = `${options.outputDir}/${slug}.mdx`;

    // 파일이 이미 존재하는지 확인
    if (await fileExists(filePath)) {
      console.log(`Skipping ${slug} (already exists)`);
      continue;
    }

    const metadata = generateMDXMetadata(item, slug);
    const content = generateMDXContent(item, metadata);

    const savedPath = await saveMDXFile(options.outputDir, slug, content);
    results.push(savedPath);

    console.log(`Saved: ${savedPath}`);
  }

  console.log(`\nConversion complete! ${results.length} new files created.`);
}

export * from "./types";
export * from "./parser";
export * from "./converter";
export * from "./fileSystem";
