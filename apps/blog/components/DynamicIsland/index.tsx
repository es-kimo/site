"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSelectedLayoutSegments } from "next/navigation";
import { HomeIsland } from "./Home";
import { IdleIsland } from "./Idle";
import { ReaderIsland } from "./Reader";
import { ResumeIsland } from "./Resume";

type View = "home" | "resume" | "reader" | "idle";

function deriveView(segments: string[]): View {
  const [domain] = segments;
  if (!domain) return "home";
  if (domain === "resume") return "resume";
  if (domain === "writing" && segments[1] === "(post)") return "reader";
  return "idle";
}

const viewComponents: Record<View, React.ReactNode> = {
  home: <HomeIsland />,
  resume: <ResumeIsland />,
  reader: <ReaderIsland />,
  idle: <IdleIsland />,
};

export const DynamicIsland = () => {
  const segments = useSelectedLayoutSegments();
  const view = deriveView(segments);

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-fit" data-dynamic-island style={{ maxWidth: "min(calc(100vw - 16px), var(--blog-max-w))" }}>
      <motion.div
        layout="size"
        transition={{
          type: "spring",
          bounce: 0.35,
        }}
        className="rounded-md border border-border bg-background/85 backdrop-blur-md overflow-hidden"
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={view}
            initial={{
              scale: 0.9,
              opacity: 0,
              filter: "blur(5px)",
            }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                bounce: 0.35,
                delay: 0.05,
              },
            }}
            exit={{
              scale: 0.9,
              opacity: 0,
              filter: "blur(5px)",
              transition: {
                type: "spring",
                bounce: 0.35,
              },
            }}
          >
            {viewComponents[view]}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
