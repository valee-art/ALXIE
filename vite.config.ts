
import { defineConfig, loadEnv } from 'vite';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Memuat env variables berdasarkan mode (production/development)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    root: '.',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 3000,
    },
    define: {
      // Menyuntikkan API_KEY dari sistem (Vercel/Netlify) ke kode browser
      // Mendukung kunci bernama 'API_KEY' atau 'VITE_API_KEY'
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY),
    }
  };
});
