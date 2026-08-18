import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  resolve: {
    // @workspace/react-lab은 심볼릭 링크된 소스 패키지라서, 잘못하면 앱과 서로
    // 다른 React 인스턴스를 잡는다. 그 순간 훅이 통째로 깨지므로 한 벌만 쓰도록 못박는다.
    dedupe: ["react", "react-dom"],
  },
});
