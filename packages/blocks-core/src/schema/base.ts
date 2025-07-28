import { z } from "zod";
import type { BlockNode } from "../types";
import { blockSchemas, containerTypesUsingChildren, type BlockType } from "./registry";

export const blockBaseSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    order: z.number().int().nonnegative(),
    parentId: z.string().nullable(),
    props: z.unknown().optional(),
    children: z.array(z.lazy(() => blockNodeSchema)).optional(),
  })
  .strict();

export const blockNodeSchema: z.ZodType<BlockNode> = blockBaseSchema.superRefine((val, ctx) => {
  const schema = blockSchemas[val.type as BlockType];
  if (!schema) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown block type: ${val.type}` });
    return;
  }

  const allowsChildren = containerTypesUsingChildren.has(val.type as BlockType);
  if (!allowsChildren && val.children) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${val.type} must not have 'children'` });
  }
  if (allowsChildren && !val.children) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${val.type} requires 'children' array` });
  }

  const result = schema.safeParse(val.props);
  if (!result.success) {
    result.error.issues.forEach((issue: z.ZodIssue) => ctx.addIssue(issue));
  }
});
