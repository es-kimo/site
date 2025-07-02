#!/usr/bin/env node

import { convertRSSToMDX } from "./index";
import type { ConvertOptions } from "./types";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: rsshub-to-mdx <twitter-username> [options]

Options:
  --output-dir <dir>     Output directory (default: ./inspiration)
  --rsshub-url <url>     RSShub URL (default: http://localhost:1200)
  --no-retweets          Exclude retweets
  --help                 Show this help message

Examples:
  rsshub-to-mdx ryurlah
  rsshub-to-mdx ryurlah --output-dir ./apps/blog/content/inspiration
  rsshub-to-mdx ryurlah --rsshub-url http://localhost:1200 --no-retweets
    `);
    process.exit(0);
  }

  if (args.includes("--help")) {
    console.log(`
Usage: rsshub-to-mdx <twitter-username> [options]

Options:
  --output-dir <dir>     Output directory (default: ./inspiration)
  --rsshub-url <url>     RSShub URL (default: http://localhost:1200)
  --no-retweets          Exclude retweets
  --help                 Show this help message

Examples:
  rsshub-to-mdx ryurlah
  rsshub-to-mdx ryurlah --output-dir ./apps/blog/content/inspiration
  rsshub-to-mdx ryurlah --rsshub-url http://localhost:1200 --no-retweets
    `);
    process.exit(0);
  }

  const twitterUsername = args[0];

  if (!twitterUsername) {
    console.error("Error: Twitter username is required");
    process.exit(1);
  }

  const options: ConvertOptions = {
    twitterUsername,
    outputDir: "./inspiration",
    rsshubUrl: "http://localhost:1200",
    includeRetweets: true,
  };

  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--output-dir" && i + 1 < args.length) {
      const outputDir = args[i + 1];
      if (outputDir) {
        options.outputDir = outputDir;
      }
      i++;
    } else if (arg === "--rsshub-url" && i + 1 < args.length) {
      const rsshubUrl = args[i + 1];
      if (rsshubUrl) {
        options.rsshubUrl = rsshubUrl;
      }
      i++;
    } else if (arg === "--no-retweets") {
      options.includeRetweets = false;
    }
  }

  try {
    await convertRSSToMDX(options);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main().catch(console.error);
