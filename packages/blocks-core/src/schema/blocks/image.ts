import { z } from "zod";

export const imageSchema = z
  .object({
    src: z.string().url(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  })
  .strict();
