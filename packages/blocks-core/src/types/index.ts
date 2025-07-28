// Blocks Core Types
// This file contains the core type definitions for blocks

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
