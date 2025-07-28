# @workspace/blocks-core

Core types and utilities for the blocks system. **Isomorphic library** - works in both Node.js (SSR/validation) and browser environments.

## Installation

This package is part of the workspace and is automatically available to other packages.

## Usage

### Node.js (SSR/Backend)

```typescript
import { blockTreeSchema, type BlockNode } from "@workspace/blocks-core";

// Validate block tree on server
const result = blockTreeSchema.safeParse(blockTree);
if (result.success) {
  console.log("Valid block tree:", result.data);
} else {
  console.log("Validation errors:", result.error.issues);
}
```

### Browser (Client-side validation)

```typescript
import { blockTreeSchema, type BlockNode } from "@workspace/blocks-core";

// Same validation works in browser
const validateBlock = (block: unknown) => {
  return blockTreeSchema.safeParse(block);
};
```

### TypeScript Types

```typescript
import type { BlockNode, BlockTree, BlockType } from "@workspace/blocks-core";

const blockTree: BlockTree = [
  {
    id: "block-1",
    type: "paragraph",
    order: 0,
    parentId: null,
    props: {
      text: "Hello, world!",
      marks: ["bold"],
    },
  },
];
```

## Block Types

The following block types are supported:

- **paragraph**: Text content with optional marks (bold, italic, etc.)
- **heading**: Headings with levels 1-3
- **list**: Bullet or numbered lists
- **image**: Images with src, alt, caption, and dimensions
- **table**: Tables with rows and optional header
- **divider**: Simple divider line
- **embed**: Embedded content (URLs, HTML)
- **faq_item**: FAQ items with question and answer
- **accordion_group**: Accordion groups with multiple items
- **cta**: Call-to-action blocks
- **info_card**: Information cards with title and body
- **section**: Container blocks that can have children
- **columns**: Multi-column layouts

## Adding New Block Types

To add a new block type:

1. Create a new schema file in `src/schema/blocks/`
2. Define the schema using Zod
3. Export the schema from the file
4. Add the schema to `blockSchemas` in `src/schema/registry.ts`
5. Update the `BlockType` type (automatically updated)
6. If the block can have children, add it to `containerTypesUsingChildren`
7. If the block has nested BlockTree in props, add it to `typesWithNestedTreesInProps`
8. Add the export to `src/index.ts`

### Example

```typescript
// src/schema/blocks/custom_block.ts
import { z } from "zod";

export const customBlockSchema = z
  .object({
    title: z.string().min(1),
    content: z.string().optional(),
  })
  .strict();
```

```typescript
// src/schema/registry.ts
import { customBlockSchema } from "./blocks/custom_block";

export const blockSchemas = {
  // ... existing schemas
  custom_block: customBlockSchema,
} as const;
```

## Build Output

This package builds to both ESM and CommonJS formats:

- **ESM**: `dist/*.js` (for modern bundlers)
- **CommonJS**: `dist/*.cjs` (for Node.js compatibility)
- **TypeScript**: `dist/*.d.ts` (type definitions)

## Exports

- `./` - Main exports (types, schemas, registry)
- `./types` - TypeScript type definitions
- `./schema/*` - Schema definitions
- `./schema/blocks/*` - Individual block schemas

## Development

```bash
pnpm build    # Build ESM + CJS + types
pnpm dev      # Watch mode
pnpm lint     # ESLint
pnpm test     # Run tests
```
