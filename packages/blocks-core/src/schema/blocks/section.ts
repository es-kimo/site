import { z } from "zod";

export const sectionSchema = z
  .object({
    variant: z.enum(["default", "highlight"]).optional(),
    padding: z.string().optional(),
  })
  .strict();
