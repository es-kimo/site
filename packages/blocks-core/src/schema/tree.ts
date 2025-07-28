import { z } from "zod";
import { blockNodeSchema } from "./base";

export const blockTreeSchema = z.array(blockNodeSchema);
