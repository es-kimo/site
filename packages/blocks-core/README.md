# @workspace/blocks-core

Core types and utilities for the blocks system.

## Installation

This package is part of the workspace and is automatically available to other packages.

## Usage

```typescript
import type { Block, BlockConfig } from "@workspace/blocks-core/lib/types.js";

const block: Block = {
  id: "example-block",
  type: "text",
  data: { content: "Hello World" },
};
```

## Exports

- `./lib/*` - Core library functions
- `./types/*` - TypeScript type definitions

## Development

```bash
pnpm lint
```
