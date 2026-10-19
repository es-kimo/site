import { SiteChrome } from "@/components/site-chrome";
import NotFound from "@workspace/ui/components/not-found";

// 루트 not-found는 (site) layout 밖에서 그려지므로 사이트 틀을 직접 두른다
export default function NotFoundPage() {
  return (
    <SiteChrome islandView="idle">
      <NotFound />
    </SiteChrome>
  );
}
