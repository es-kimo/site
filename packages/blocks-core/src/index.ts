// Core exports
export * from "./types";
export * from "./schema/registry";
export * from "./schema/tree";
export * from "./lib/normalize";

// Re-export commonly used types
export type { BlockNode, BlockTree, Block, BlockConfig } from "./types";
export type { BlockType } from "./schema/registry";
export type { BlockTreeSchema, BlockNodeSchema } from "./schema/tree";

// Export examples
export { runNormalizationExample, serverActionExample } from "./examples/normalization-example";
