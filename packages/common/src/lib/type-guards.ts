import { CATEGORIES } from "@workspace/common/structure/notes";
import { Category } from "@workspace/common/structure/notes.types";

export const isCategory = (str: unknown): str is Category => {
  if (typeof str !== "string") {
    return false;
  }

  return CATEGORIES.includes(str);
};
