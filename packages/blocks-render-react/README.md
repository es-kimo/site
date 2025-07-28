# @workspace/blocks-render-react

React components and hooks for rendering blocks.

## Installation

This package is part of the workspace and depends on `@workspace/blocks-core`.

## Usage

```tsx
import { BlockRenderer } from "@workspace/blocks-render-react/components/BlockRenderer.js";
import { useBlock } from "@workspace/blocks-render-react/hooks/useBlock.js";

function MyComponent() {
  const { block, loading, error } = useBlock("example-block-id");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!block) return <div>No block found</div>;

  return <BlockRenderer block={block} />;
}
```

## Exports

- `./components/*` - React components for rendering blocks
- `./hooks/*` - React hooks for block management
- `./lib/*` - Utility functions

## Development

```bash
pnpm lint
```
