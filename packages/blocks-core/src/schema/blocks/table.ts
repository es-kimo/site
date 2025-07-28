import { z } from "zod";

export const tableSchema = z
  .object({
    rows: z.array(z.array(z.string())).min(1),
    hasHeader: z.boolean().optional(),
  })
  .strict();
