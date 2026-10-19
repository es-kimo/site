import { DynamicIsland, type View } from "@/components/DynamicIsland";
import { SiteFooter } from "@/components/site-footer";

/** 사이트 페이지의 바깥 틀. 섬, 푸터, 본문 여백을 둔다. */
export function SiteChrome({ children, islandView }: { children: React.ReactNode; islandView?: View }) {
  return (
    <>
      {/* 짧은 페이지에서도 푸터가 화면 아래에 붙도록 한다 */}
      <div className="flex min-h-dvh flex-col print:block print:min-h-0">
        <div className="flex-1">
          <div className="max-w-blog mx-auto py-20 px-4">{children}</div>
        </div>
        <SiteFooter />
      </div>
      <DynamicIsland view={islandView} />
    </>
  );
}
