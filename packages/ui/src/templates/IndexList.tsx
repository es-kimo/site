import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ExternalLink } from "lucide-react";
import { ComponentType, ReactNode } from "react";

interface IndexListProps {
  children: ReactNode;
}

interface IndexListHeaderProps {
  children: ReactNode;
}

interface IndexListGridProps {
  children: ReactNode;
}

interface IndexListItemProps {
  Link: ComponentType<{ href: string; key?: string; className?: string; children: React.ReactNode }>;
  item: string;
  href: string;
  title: string;
  hashtags?: string[];
}

const IndexList = ({ children }: IndexListProps) => {
  return <section className="px-6 py-8 mx-auto">{children}</section>;
};

const IndexListHeader = ({ children }: IndexListHeaderProps) => {
  return (
    <h2 className="text-xl font-semibold mb-4">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{children}</span> 글 모음
    </h2>
  );
};

const IndexListGrid = ({ children }: IndexListGridProps) => {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>;
};

const IndexListItem = ({ Link, item, hashtags, href, title }: IndexListItemProps) => {
  return (
    <Link href={href} key={item} className="block">
      <Card className="group relative h-64 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300 overflow-hidden flex flex-col">
        <CardHeader className="flex-none">
          <CardTitle className="text-xl font-medium line-clamp-2">{title}</CardTitle>
          <div className="mt-2 h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {hashtags?.map((hashtag, i) => (
              <Badge key={i} variant="outline">
                {hashtag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            자세히 보기 <ExternalLink />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

IndexList.Header = IndexListHeader;
IndexList.Grid = IndexListGrid;
IndexList.Item = IndexListItem;

export { IndexList };
