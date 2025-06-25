import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@workspace/ui/components/card";
import { Calendar, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface YoutubePlaylistProps {
  videos: VideoItem[];
}

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

export function VideoCard({ video }: { video: VideoItem }) {
  const { title, description, thumbnails, resourceId } = video.snippet;
  const { videoPublishedAt } = video.contentDetails;
  const titleId = `video-title-${video.id}`;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <Card role="group" aria-labelledby={titleId} className="group flex flex-col rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-white h-full">
      <CardHeader className="p-0 relative">
        <Link href={`https://www.youtube.com/watch?v=${resourceId.videoId}`} target="_blank" rel="noopener noreferrer">
          <AspectRatio ratio={16 / 9} className="relative">
            <Image src={thumbnails.maxres?.url ?? thumbnails.high.url} alt={title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
            <h3 id={titleId} className="absolute bottom-3 left-3 right-3 text-white text-lg font-semibold drop-shadow-md line-clamp-2">
              {title}
            </h3>
          </AspectRatio>
        </Link>
      </CardHeader>

      <CardContent className="pt-4 flex-1">
        <CardDescription className="line-clamp-6">{description}</CardDescription>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2">
        <div className="flex text-xs text-gray-500 space-x-4">
          <div className="flex gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(videoPublishedAt)}</span>
          </div>
        </div>
        <Button variant="outline" className="group-hover:bg-blue-50 transition-colors w-full" asChild>
          <Link href={`https://www.youtube.com/watch?v=${resourceId.videoId}`} target="_blank" rel="noopener noreferrer">
            <Play className="w-4 h-4" />
            <span className="text-sm">시청</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function YoutubePlaylist({ videos }: YoutubePlaylistProps) {
  const sorted = [...videos].sort((a, b) => {
    const aTime = new Date(a.contentDetails.videoPublishedAt).getTime();
    const bTime = new Date(b.contentDetails.videoPublishedAt).getTime();
    return aTime - bTime;
  });

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sorted.map((video) => (
        <li key={video.id}>
          <VideoCard video={video} />
        </li>
      ))}
    </ul>
  );
}
