import React from "react";
import type { Block } from "@workspace/blocks-core/types/index";

interface BlockRendererProps {
  block: Block;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  return (
    <div className="block-renderer">
      <div className="block-type">{block.type}</div>
      <div className="block-data">
        <pre>{JSON.stringify(block.data, null, 2)}</pre>
      </div>
    </div>
  );
}
