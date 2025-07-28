import { z } from "zod";

export const marksSchema = z.array(z.enum(["bold", "italic", "underline", "strike", "code", "link"])).optional();

export const paragraphSchema = z
  .object({
    text: z.string().min(1),
    marks: marksSchema,
  })
  .strict();
