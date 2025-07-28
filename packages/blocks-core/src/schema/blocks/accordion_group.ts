import { z } from "zod";
import { blockTreeSchema } from "../tree";

export const accordionGroupSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            title: z.string().min(1),
            body: z.lazy(() => blockTreeSchema),
          })
          .strict()
      )
      .min(1),
  })
  .strict();
