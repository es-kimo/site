# @workspace/blocks-core

Core types and utilities for the blocks system with normalization support.

## Installation

This package is part of the workspace and is automatically available to other packages.

## Features

### Block Normalization System

The blocks-core package provides a comprehensive normalization system that ensures consistent data structure and applies default values before saving to the database.

#### Key Principles

1. **Required vs Optional Fields**

   - **Required**: Essential for document validity (enforced by Zod min(1) etc.)
   - **Optional**: Fields that don't affect UI/rendering or have reasonable defaults

2. **Default Value Injection**

   - Applied during server-side save operations via `normalizeBlockTree()`
   - Ensures DB always contains complete, normalized data
   - Minimizes undefined/null values in stored data

3. **Normalization Timing**
   - Server actions call `normalizeBlockTree()` before saving
   - Client/rendering code doesn't need to handle undefined values
   - Order values are automatically assigned (100, 200, 300...)

#### Block Type Default Values

| Type            | Field        | Optional? | Default     | Notes                                 |
| --------------- | ------------ | --------- | ----------- | ------------------------------------- |
| paragraph       | marks        | ✅        | `[]`        | Empty array                           |
| heading         | level        | ✅        | `2`         | H2 default, H1 for document root only |
| list            | style        | ✅        | `"bullet"`  | Bullet list default                   |
| image           | alt          | ✅        | `""`        | Empty string for accessibility        |
| image           | caption      | ✅        | `""`        | Can be hidden                         |
| image           | width/height | ✅        | `undefined` | Use natural size in renderer          |
| table           | hasHeader    | ✅        | `false`     | Don't use first row as header         |
| divider         | —            | —         | —           | Empty object                          |
| embed           | provider     | ✅        | Inferred    | Auto-detect from URL                  |
| embed           | html         | ✅        | `undefined` | Server-side prerender if needed       |
| faq_item        | —            | —         | —           | question/answer required              |
| accordion_group | —            | —         | —           | items min 1                           |
| cta             | description  | ✅        | `""`        |                                       |
| info_card       | icon         | ✅        | `undefined` |                                       |
| info_card       | image        | ✅        | `undefined` |                                       |
| section         | variant      | ✅        | `"default"` |                                       |
| section         | padding      | ✅        | `"md"`      | "sm/md/lg" predefined                 |
| columns         | —            | —         | —           | min 2, max 3                          |

#### Nested Block Structure

- **section**: Uses `children` field for nested blocks
- **faq_item**: Uses `answer` prop containing BlockTree
- **accordion_group**: Uses `items[].body` prop containing BlockTree
- **info_card**: Uses `body` prop containing BlockTree
- **columns**: Uses `columns[]` prop containing BlockTree

## Usage

### Basic Normalization

```typescript
import { normalizeBlockTree, validateBlockTree } from "@workspace/blocks-core";

// Raw block tree (may have missing optional fields)
const rawBlockTree = [
  {
    id: "block-1",
    type: "heading",
    order: 0,
    parentId: null,
    props: {
      text: "제목",
      // level is missing (will get default value 2)
    },
  },
  {
    id: "block-2",
    type: "paragraph",
    order: 100,
    parentId: null,
    props: {
      text: "이것은 단락입니다.",
      // marks is missing (will get default value [])
    },
  },
];

// Normalize the block tree
const normalizedTree = normalizeBlockTree(rawBlockTree);

// Validate before saving
const validation = validateBlockTree(normalizedTree);
if (!validation.valid) {
  console.error("Validation errors:", validation.errors);
}
```

### Server Action Integration

```typescript
import { normalizeBlockTree, validateNormalizedTree } from "@workspace/blocks-core";

export async function saveBlockTree(rawBlockTree: BlockTree) {
  try {
    // 1. Normalize the block tree
    const normalizedTree = normalizeBlockTree(rawBlockTree);

    // 2. Validate the normalized tree
    const validation = validateNormalizedTree(normalizedTree);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // 3. Save to database
    await db.blocks.save(normalizedTree);

    return { success: true, data: normalizedTree };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Provider Inference

The normalization system automatically infers embed providers from URLs:

```typescript
// These URLs will automatically get their providers inferred:
// - youtube.com/youtu.be → "youtube"
// - vimeo.com → "vimeo"
// - maps.google.com → "map"
// - twitter.com/x.com → "twitter"
// - instagram.com → "instagram"
// - facebook.com → "facebook"
// - linkedin.com → "linkedin"
// - others → "generic"
```

## Migration Strategy

When default values need to be changed:

1. Update the default values in the schema registry
2. Increment the normalization version
3. Run a migration script to update existing data
4. Update renderers to handle new defaults

## Exports

- `./types` - Core type definitions
- `./schema/registry` - Block type registry and schemas
- `./schema/tree` - Block tree schema with recursive validation
- `./lib/normalize` - Normalization utilities
- `./examples/normalization-example` - Usage examples

## Development

```bash
pnpm lint
pnpm build
pnpm test
```

## Testing the Normalization System

```bash
# Run the normalization example
cd packages/blocks-core
pnpm build
node dist/examples/normalization-example.js
```

This will demonstrate how the normalization system works with various block types and their default values.
