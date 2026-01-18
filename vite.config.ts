
import { defineConfig } from 'vite';
import { env } from 'process';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
  // Menyuntikkan process.env.API_KEY agar bisa dibaca di browser
  define: {
    'process.env.API_KEY': JSON.stringify(env.API_KEY),
  }
});
