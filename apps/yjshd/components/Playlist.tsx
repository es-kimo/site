"use client";

import { useState, useMemo } from "react";
import { VideoItem, VideoCard } from "./VideoCard";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@workspace/ui/components/select";
import { List, Grid } from "lucide-react";
import { motion } from "framer-motion";

interface PlaylistClientProps {
  videos: VideoItem[];
}

export default function PlaylistClient({ videos }: PlaylistClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => videos.filter((v) => v.snippet.title.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm, videos]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.snippet.publishedAt).getTime();
      const bTime = new Date(b.snippet.publishedAt).getTime();
      return sortBy === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [sortBy, filtered]);

  return (
    <section className="container mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <Input placeholder="강좌 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md" />

        <div className="flex items-center space-x-4">
          <Select onValueChange={(v) => setSortBy(v as "newest" | "oldest")}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">최신순</SelectItem>
              <SelectItem value="oldest">오래된 순</SelectItem>
            </SelectContent>
          </Select>

          <button aria-label="Toggle view mode" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {viewMode === "grid" ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <motion.div layout className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-6"}>
        {sorted.map((video) => (
          <motion.div key={video.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <VideoCard video={video} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
