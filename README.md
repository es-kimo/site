# Modern Monorepo Template

A modern, type-safe monorepo template powered by Turborepo and shadcn/ui, designed for building scalable web applications.

## 🌟 Features

- 📦 Monorepo structure with Turborepo
- 🎨 Shared UI components with shadcn/ui
- 🔒 Type-safe with TypeScript
- 🎯 Next.js applications
- 🛠 Shared configurations (ESLint, TypeScript, Tailwind)

## 📁 Project Structure

```
├── apps/
│   ├── blog/          # Blog application
│   └── yjshd/         # Web application
└── packages/
    ├── ui/            # Shared UI components
    ├── common/        # Common utilities
    └── mdx-cli/       # MDX tooling
```

## 🚀 Getting Started

1. **Setup**

   ```bash
   pnpm install
   ```

2. **Development**

   ```bash
   pnpm dev
   ```

3. **Build**
   ```bash
   pnpm build
   ```

## 💅 UI Components

This template uses shadcn/ui for beautiful, accessible components. Add new components to your app:

```bash
pnpm dlx shadcn@latest add button -c apps/[app-name]
```

Import components in your app:

```tsx
import { Button } from "@workspace/ui/components/ui/button";
```

## 📦 Package Management

- `@workspace/ui`: Shared UI components
- `@workspace/common`: Common utilities and helpers
- `@workspace/mdx-cli`: MDX processing tools

## 📄 License

MIT
