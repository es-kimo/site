import { parseString } from "xml2js";
import fetch from "node-fetch";
import type { RSSFeed, RSSItem, ConvertOptions } from "./types";

export async function fetchRSSFeed(options: ConvertOptions): Promise<string> {
  const { rsshubUrl, twitterUsername, includeRetweets = true } = options;
  const url = `${rsshubUrl}/twitter/user/${twitterUsername}${includeRetweets ? "?includeRts=1" : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
  }

  return response.text();
}

export async function parseRSSXML(xmlString: string): Promise<RSSFeed> {
  return new Promise((resolve, reject) => {
    parseString(xmlString, { explicitArray: false }, (err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result as RSSFeed);
      }
    });
  });
}

export function extractTweetItems(feed: RSSFeed): RSSItem[] {
  if (!feed.rss?.channel) {
    return [];
  }

  const channel = Array.isArray(feed.rss.channel) ? feed.rss.channel[0] : feed.rss.channel;

  if (!channel?.item) {
    return [];
  }

  const items = Array.isArray(channel.item) ? channel.item : [channel.item];

  return items.filter(Boolean);
}
