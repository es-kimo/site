import type { Category } from "@/constants/notes.types";

export interface LocaleResources {
  ko: {
    translation: Record<Category, string> & Record<string, string>;
  };
  en: {
    translation: Record<Category, string> & Record<string, string>;
  };
}

export const localeResources: LocaleResources = {
  ko: {
    translation: {
      cs: "컴퓨터과학",
      fe: "프론트엔드",
      be: "백엔드",
      algo: "알고리즘",
      architecture: "컴퓨터구조",
    },
  },
  en: {
    translation: {
      cs: "computer science",
      fe: "frontend",
      be: "backend",
      algo: "algorithm",
      architecture: "computer architecture",
    },
  },
};
