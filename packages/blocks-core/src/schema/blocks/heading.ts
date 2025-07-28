import { z } from "zod";

export const headingSchema = z
  .object({
    text: z.string().min(1),
    level: z.enum(["1", "2", "3"]).transform(Number),
  })
  .strict();
