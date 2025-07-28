import { z } from "zod";

export const listSchema = z
  .object({
    style: z.enum(["bullet", "numbered"]),
    items: z.array(z.string().min(1)).min(1),
  })
  .strict();
