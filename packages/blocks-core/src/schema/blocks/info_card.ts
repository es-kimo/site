import { z } from "zod";
import { blockTreeSchema } from "../tree";

export const infoCardSchema = z
  .object({
    title: z.string().min(1),
    body: z.lazy(() => blockTreeSchema),
    icon: z.string().optional(),
    image: z.string().url().optional(),
  })
  .strict();
