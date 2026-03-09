import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { Link } from "next-view-transitions";
import Image from "next/image";
import KHLogo from "../assets/icon.png";

interface IconLogoProps {
  showBackHint?: boolean;
}

export const IconLogo = ({ showBackHint = false }: IconLogoProps) => {
  if (!showBackHint) {
    return (
      <Button variant="ghost" size="icon" aria-label="Go Home" asChild>
        <Link href="/">
          <Image src={KHLogo} alt="KHLogo" width={24} height={24} />
        </Link>
      </Button>
    );
  }

  return (
    <Link href="/" aria-label="Go Home" className={cn("group inline-flex items-center rounded-md", "h-9 pl-1 pr-2", "hover:bg-accent/50", "transition-colors duration-200")}>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 14, opacity: 1 }}
        transition={{
          type: "spring",
          bounce: 0.35,
          delay: 0.25,
        }}
        className="overflow-hidden flex items-center shrink-0"
      >
        <motion.div
          animate={{ x: [0, -2, 0] }}
          transition={{
            repeat: 3,
            repeatDelay: 4,
            duration: 0.8,
            ease: "easeInOut",
            delay: 1.2,
          }}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-foreground/30 group-hover:text-foreground/70 transition-colors duration-200" strokeWidth={2.5} />
        </motion.div>
      </motion.div>
      <Image src={KHLogo} alt="KHLogo" width={24} height={24} className="shrink-0" />
    </Link>
  );
};
