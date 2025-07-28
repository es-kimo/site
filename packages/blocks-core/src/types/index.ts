// Blocks Core Types
// This file contains the core type definitions for blocks

export interface BlockNode {
  id: string;
  type: string;
  order: number;
  parentId: string | null;
  props: Record<string, unknown>;
  children?: BlockNode[];
}

export type BlockTree = BlockNode[];

export interface Block {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface BlockConfig {
  name: string;
  version: string;
  description?: string;
}

// Normalization types
export interface NormalizationContext {
  fallbackOrder: number;
  parentId?: string | null;
}

export interface NormalizedBlockNode extends BlockNode {
  order: number; // Always present after normalization
  props: Record<string, unknown>; // Always has defaults applied
}
