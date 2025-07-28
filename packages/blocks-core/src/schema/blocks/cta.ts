import { z } from "zod";

export const ctaSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    buttonText: z.string().min(1),
    href: z.string().url(),
  })
  .strict();
