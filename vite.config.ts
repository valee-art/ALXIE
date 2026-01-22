import { defineConfig, loadEnv } from 'vite';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Muat semua environment variables dari sistem (termasuk Netlify)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Deteksi kunci dengan beberapa kemungkinan nama (VITE_API_KEY adalah standar Vite)
  const apiKey = env.API_KEY || env.VITE_API_KEY || "";

  // Log bantuan di terminal build (Hanya muncul di log deploy Netlify, bukan di browser)
  if (!apiKey) {
    console.warn("⚠️ PERINGATAN: API_KEY tidak ditemukan saat proses build!");
  } else {
    console.log("✅ API_KEY berhasil ditemukan dan disuntikkan.");
  }

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
      // Teknik ini akan mengganti tulisan 'process.env.API_KEY' di kode kamu menjadi string kuncinya
      'process.env.API_KEY': JSON.stringify(apiKey),
    }
  };
});