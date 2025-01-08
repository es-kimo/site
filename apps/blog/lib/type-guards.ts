import { CATEGORIES } from "@/constants/categories";
import { Category } from "@/constants/categories.types";

export const isCategory = (str: unknown): str is Category => {
  if (typeof str !== "string") {
    return false;
  }

  return (CATEGORIES as ReadonlyArray<string>).includes(str);
};
