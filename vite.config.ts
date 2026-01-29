import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Use process.cwd() which is available globally in Node.js environments like Vite config.
  // Removing the explicit import resolves conflicts with other 'Process' type definitions.
  // Cast to any is used here because global Process type may not include cwd() in all environments
  const env = loadEnv(mode, (process as any).cwd(), '');
  
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