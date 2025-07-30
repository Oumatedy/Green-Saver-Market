import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src')
        }
      ],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    build: {
      sourcemap: isDev,
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-tooltip', '@radix-ui/react-dialog']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    server: {
      port: 5173,
      strictPort: true
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  }
});
