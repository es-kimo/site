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

  const toggleLanguage = async () => {
    const newLanguage: Language = currentLanguage === "ko" ? "en" : "ko";

    // View Transitions API 직접 사용
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      const doc = document as Document & { startViewTransition: (callback: () => Promise<void>) => { finished: Promise<void> } };
      const transition = doc.startViewTransition(async () => {
        // 쿠키 저장
        await setLanguage(newLanguage);

        // React transition으로 refresh 래핑
        return new Promise<void>((resolve) => {
          startTransition(() => {
            router.refresh();
            // 약간의 딜레이를 주어 DOM 업데이트 확인
            setTimeout(resolve, 0);
          });
        });
      });

      await transition.finished;
    } else {
      // Fallback for browsers without View Transitions support
      startTransition(async () => {
        await setLanguage(newLanguage);
        router.refresh();
      });
    }
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
      <span className="text-sm font-medium">{isPending ? "" : currentLanguage === "ko" ? "EN" : "KO"}</span>
    </Button>
  );
}
