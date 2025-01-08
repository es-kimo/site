import { CATEGORIES } from "@/constants/notes";
import { Category } from "@/constants/notes.types";

export const isCategory = (str: unknown): str is Category => {
  if (typeof str !== "string") {
    return false;
  }

  return CATEGORIES.includes(str);
};
