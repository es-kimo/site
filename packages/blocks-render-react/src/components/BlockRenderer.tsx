import React from "react";
import type { BlockNode } from "@workspace/blocks-core";

interface BlockRendererProps {
  block: BlockNode;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  return (
    <div className="block-renderer">
      <div className="block-type">{block.type}</div>
      <div className="block-order">Order: {block.order}</div>
      <div className="block-props">
        <pre>{JSON.stringify(block.props, null, 2)}</pre>
      </div>
      {block.children && block.children.length > 0 && (
        <div className="block-children">
          <h4>Children:</h4>
          {block.children.map((child) => (
            <BlockRenderer key={child.id} block={child} />
          ))}
        </div>
      )}
    </div>
  );
}
