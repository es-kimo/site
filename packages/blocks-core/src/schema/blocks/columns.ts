import { z } from "zod";
import { blockTreeSchema } from "../tree";

export const columnsSchema = z
  .object({
    columns: z
      .array(z.lazy(() => blockTreeSchema))
      .min(2)
      .max(3),
  })
  .strict();
