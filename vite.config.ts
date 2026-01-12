import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path"; // 1. path 모듈 추가

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // @를 src 폴더로 연결 (서버 밖으로 꺼냈습니다)
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://apis.data.go.kr",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});