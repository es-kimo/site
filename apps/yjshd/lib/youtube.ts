const PLAYLIST_ID = process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID ?? "";
const API_KEY = process.env.YOUTUBE_API_KEY ?? "";

export interface VideoItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string; // ISO 8601 datetime
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      /** 기본 썸네일 (120×90 또는 채널 88×88) */
      default: {
        url: string;
        width: number;
        height: number;
      };
      /** 중간 해상도 (동영상 320×180, 채널 240×240) */
      medium: {
        url: string;
        width: number;
        height: number;
      };
      /** 고해상도 (동영상 480×360, 채널 800×800) */
      high: {
        url: string;
        width: number;
        height: number;
      };
      /** 스탠다드 해상도 (640×480) */
      standard?: {
        url: string;
        width: number;
        height: number;
      };
      /** 최고 해상도 (1280×720) */
      maxres?: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
    videoOwnerChannelTitle: string;
    videoOwnerChannelId: string;
    playlistId: string;
    position: number;
    resourceId: {
      kind: string;
      videoId: string;
    };
  };
  contentDetails: {
    videoId: string;
    startAt: string; // e.g. "00:01:23"
    endAt: string; // e.g. "00:04:56"
    note: string;
    videoPublishedAt: string; // ISO 8601 datetime
  };
  status: {
    privacyStatus: string; // e.g. "public" | "private" | "unlisted"
  };
}

export interface YoutubePlaylistResponse {
  items: VideoItem[];
  nextPageToken?: string;
  prevPageToken?: string;
  kind: string;
  etag: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
}

export const revalidate = 3600;

export async function getVideos(pageToken?: string) {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    maxResults: "18",
    playlistId: PLAYLIST_ID,
    key: API_KEY,
    ...(pageToken ? { pageToken } : {}),
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`, { next: { revalidate } });
  return (await res.json()) as YoutubePlaylistResponse;
}
