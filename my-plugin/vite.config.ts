import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  mode: mode,
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  esbuild: {
    minifyIdentifiers: mode === 'production',
    treeShaking: mode === 'production',
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(process.cwd(), 'src/index.tsx'),
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        preserveModules: false,
      },
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        '@stagewise/plugin-sdk',
      ],
      treeshake: mode === 'production',
    },
    minify: mode === 'production',
    cssMinify: mode === 'production',
  },
});
