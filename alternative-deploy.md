
# Alternatif Tempat Deploy ALXIE 🌐

Jika Vercel bermasalah, cobalah dua platform gratis terbaik ini:

---

## 1. Netlify (Sangat Mudah)
1. Buat akun di [Netlify](https://www.netlify.com/).
2. Hubungkan repository GitHub Anda.
3. Di bagian **Site Settings** > **Environment Variables**:
   - Tambahkan variabel baru.
   - Key: `VITE_API_KEY` (Netlify menyukai awalan `VITE_`)
   - Value: (Kunci API Gemini Anda)
4. Klik **Deploy Site**.
5. Jika sudah selesai, buka URL yang diberikan.

## 2. Cloudflare Pages (Tercepat)
1. Buat akun di [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Pergi ke **Workers & Pages** > **Create application** > **Pages**.
3. Hubungkan GitHub Anda.
4. Pada bagian **Build Settings**:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Sebelum klik deploy, cari tab **Environment Variables (Optional)**:
   - Tambahkan variabel.
   - Variable Name: `VITE_API_KEY`
   - Value: (Kunci API Gemini Anda)
6. Klik **Save and Deploy**.

---

### Kenapa tetap Error? (Checklist Terakhir)
1. **Build Time**: API Key harus ada **sebelum** proses build dimulai. Jika Anda menambahkan key *setelah* deploy, Anda harus melakukan **Clear Cache & Redeploy**.
2. **Kunci API**: Pastikan kunci API Anda di [Google AI Studio](https://aistudio.google.com/) berstatus **Active** dan tidak ada batasan regional (biasanya Indonesia aman).
3. **Quoata**: Pastikan Anda belum melewati batas gratis (Free Tier) Gemini API.

**Saran Ahli**: Gunakan nama variabel `VITE_API_KEY` di Dashboard platform apa pun yang Anda pilih, karena ini adalah standar paling aman untuk aplikasi berbasis Vite.
