
# Instruksi Deploy ke Netlify (Drag and Drop)

Karena aplikasi ini dibangun menggunakan React dan Tailwind, kamu perlu melakukan langkah berikut:

1. **Persiapan**: 
   Aplikasi ini dirancang sebagai Single Page Application. Pastikan semua file (`index.html`, `App.tsx`, dll) sudah siap.
   
2. **Build**: 
   Jika kamu menjalankan ini di lingkungan pengembangan lokal, jalankan perintah build (biasanya `npm run build`). 
   *Namun, jika kamu menggunakan playground AI ini, cukup ambil folder outputnya.*

3. **Deploy ke Netlify**:
   - Buka [Netlify Drops](https://app.netlify.com/drop).
   - Pastikan folder kamu berisi `index.html` di tingkat root.
   - Seret (Drag) folder aplikasi kamu ke area yang disediakan di website Netlify.
   - Tunggu beberapa detik hingga proses upload selesai.
   - Website kamu akan langsung online!

4. **Konfigurasi Environment Variable**:
   Aplikasi ini memerlukan Gemini API Key.
   - Di dashboard Netlify, buka **Site settings** > **Environment variables**.
   - Tambahkan variabel baru:
     - Key: `API_KEY`
     - Value: [Masukkan API Key Gemini Kamu]

5. **Selesai!** Website ALXIE kamu sudah bisa diakses oleh dunia.
