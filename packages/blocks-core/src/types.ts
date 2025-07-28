export type BlockID = string;

export interface BlockBase {
  id: BlockID;
  type: string;
  order: number;
  parentId: string | null;
  props?: unknown;
  children?: BlockNode[];
}

export type BlockNode = BlockBase;
export type BlockTree = BlockNode[];
