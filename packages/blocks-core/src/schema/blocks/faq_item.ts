import { z } from "zod";
import { blockTreeSchema } from "../tree";

export const faqItemSchema = z
  .object({
    question: z.string().min(1),
    answer: z.lazy(() => blockTreeSchema),
  })
  .strict();
