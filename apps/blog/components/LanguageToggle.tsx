"use client";

import { setLanguage, type Language } from "@/lib/language";
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface LanguageToggleProps {
  currentLanguage: Language;
}

export function LanguageToggle({ currentLanguage }: LanguageToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const newLanguage: Language = currentLanguage === "ko" ? "en" : "ko";
    
    startTransition(async () => {
      await setLanguage(newLanguage);
      router.refresh();
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      disabled={isPending}
      className="relative h-9 w-9 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
      aria-label="Toggle language"
    >
      <span className="text-sm font-medium">
        {isPending ? "..." : currentLanguage === "ko" ? "EN" : "KO"}
      </span>
    </Button>
  );
}

