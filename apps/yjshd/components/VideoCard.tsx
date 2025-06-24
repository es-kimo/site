import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@workspace/ui/components/card";
import { Calendar, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface VideoItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    resourceId: {
      videoId: string;
    };
    publishedAt: string; // ISO date string
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
    defaultLanguage?: string;
    localized?: {
      title: string;
      description: string;
    };
  };
  status: {
    privacyStatus: string;
    podcastStatus?: string;
  };
  contentDetails: {
    itemCount: number;
  };
  player: {
    embedHtml: string;
  };
  /** BCP-47 언어 코드를 키로 사용하는 현지화된 제목/설명 맵 */
  localizations?: Record<
    string,
    {
      title: string;
      description: string;
    }
  >;
}

export function VideoCard({ video }: { video: VideoItem }) {
  const { title, description, thumbnails, publishedAt, resourceId } = video.snippet;
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
        <AspectRatio ratio={16 / 9} className="relative">
          <Image src={thumbnails.medium.url} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
          <h3 id={titleId} className="absolute bottom-3 left-3 right-3 text-white text-lg font-semibold drop-shadow-md line-clamp-2">
            {title}
          </h3>
        </AspectRatio>
      </CardHeader>

      <CardContent className="pt-4 flex-1">
        <CardDescription className="line-clamp-6">{description}</CardDescription>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2">
        <div className="flex text-xs text-gray-500 space-x-4">
          <div className="flex gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(publishedAt)}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="group-hover:bg-blue-50 transition-colors self-end">
          <Link href={`https://www.youtube.com/watch?v=${resourceId.videoId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            <Play className="w-4 h-4" />
            <span className="text-sm">시청</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
