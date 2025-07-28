import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/lib/index.ts",
    "components/BlockRenderer": "src/components/BlockRenderer.tsx",
    "hooks/useBlock": "src/hooks/useBlock.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "@workspace/blocks-core"],
});
