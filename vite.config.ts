import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 청크 크기 경고 제한을 1600kB로 상향 조정하여 불필요한 경고 제거
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // 라이브러리별로 파일을 분리하여 캐싱 효율 증대 및 파일 크기 분산
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
          ai: ['@google/genai']
        }
      }
    }
  }
});
