# @workspace/blocks-render-react

React components and hooks for rendering blocks. **React library** - works in both client-side and SSR environments.

## Installation

This package is part of the workspace and depends on `@workspace/blocks-core`.

## Usage

### Client-side React

```tsx
import { BlockRenderer } from "@workspace/blocks-render-react/components/BlockRenderer";
import { useBlock } from "@workspace/blocks-render-react/hooks/useBlock";
import type { BlockNode } from "@workspace/blocks-core";

function MyComponent() {
  const { block, loading } = useBlock("example-block-id");

  if (loading) return <div>Loading...</div>;
  if (!block) return <div>No block found</div>;

  return <BlockRenderer block={block} />;
}
```

### Server-side Rendering (SSR)

```tsx
import { BlockRenderer } from "@workspace/blocks-render-react/components/BlockRenderer";
import type { BlockNode } from "@workspace/blocks-core";

// Render blocks on server
function BlockTreeRenderer({ blocks }: { blocks: BlockNode[] }) {
  return (
    <div>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
```

### Direct Import

```tsx
import { BlockRenderer } from "@workspace/blocks-render-react";
import type { BlockNode } from "@workspace/blocks-core";

const block: BlockNode = {
  id: "example",
  type: "paragraph",
  order: 0,
  parentId: null,
  props: { text: "Hello World" },
};

<BlockRenderer block={block} />;
```

## Components

- **BlockRenderer**: Renders a single block with its children recursively
- **useBlock**: Hook for fetching and managing block data

## Build Output

This package builds to both ESM and CommonJS formats:

- **ESM**: `dist/*.js` (for modern bundlers)
- **CommonJS**: `dist/*.cjs` (for Node.js compatibility)
- **TypeScript**: `dist/*.d.ts` (type definitions)

## Exports

- `./` - Main exports
- `./components/*` - React components for rendering blocks
- `./hooks/*` - React hooks for block management
- `./lib/*` - Utility functions

## Development

```bash
pnpm build    # Build ESM + CJS + types
pnpm dev      # Watch mode
pnpm lint     # ESLint
```
