
# Panduan Deploy ALXIE ke Vercel 🚀

Jika AI ALXIE "masih error", ikuti langkah-langkah ini di dashboard Vercel Anda:

### 1. Masuk ke Dashboard Vercel
Buka [Vercel](https://vercel.com/) dan pilih proyek **ALXIE** Anda.

### 2. Atur Environment Variables
Ini langkah yang paling krusial agar AI berfungsi:
- Klik tab **Settings** di atas.
- Klik menu **Environment Variables** di sisi kiri.
- Tambahkan variabel baru:
  - **Key**: `API_KEY`
  - **Value**: (Tempelkan API Key dari Google AI Studio, contoh: `AIzaSy...`)
- Klik **Save**.

### 3. Lakukan Redeploy (PENTING)
Vercel tidak akan membaca kunci baru sampai Anda melakukan deploy ulang:
- Klik tab **Deployments**.
- Cari deployment paling atas (terbaru).
- Klik titik tiga `...` di sebelah kanan.
- Pilih **Redeploy**.
- Tunggu proses build selesai.

### 4. Cara Cek Jika Masih Error
Jika AI masih tidak merespons:
1. Buka website ALXIE Anda.
2. Tekan tombol **F12** (atau klik kanan > Inspect) lalu pilih tab **Console**.
3. Jika ada tulisan `ALXIE: API_KEY is missing`, berarti kunci Anda belum terpasang dengan benar di Vercel.
4. Pastikan Anda tidak memasukkan tanda kutip dalam kolom "Value" di Vercel.

### Cara Mendapatkan API Key Gratis:
- Buka [Google AI Studio](https://aistudio.google.com/app/apikey).
- Klik **Create API Key**.
