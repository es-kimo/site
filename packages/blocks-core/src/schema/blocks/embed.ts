import { z } from "zod";

export const embedSchema = z
  .object({
    url: z.string().url(),
    provider: z.string().optional(),
    html: z.string().optional(),
  })
  .strict();
