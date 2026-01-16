
import React from 'react';

interface DisclaimerProps {
  isDarkMode: boolean;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ isDarkMode }) => {
  const cardBg = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm';
  const headingColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const textColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className={`text-3xl font-bold ${headingColor} mb-6`}>Disclaimer</h2>
      <div className={`${cardBg} border rounded-2xl p-8 space-y-6 transition-colors`}>
        <div className={`space-y-4 ${textColor} text-base leading-relaxed`}>
          <p className={`${headingColor} font-semibold`}>Harap baca dengan teliti:</p>
          <p>
            <span className="text-blue-600 font-bold">ALXIE bukan layanan medis atau psikolog profesional.</span> Platform ini adalah inisiatif mandiri untuk dukungan sebaya (peer support) dan tidak memiliki lisensi profesional kesehatan mental.
          </p>
          <p>
            Platform ini tidak menggantikan bantuan tenaga ahli (psikolog, psikiater, atau dokter). Kami tidak melakukan diagnosis, memberikan terapi medis, atau menjanjikan penyembuhan.
          </p>
          <p>
            Dibuat oleh individu usia 16 tahun sebagai bentuk kepedulian sosial terhadap kesehatan mental remaja dan orang tua.
          </p>
          <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl">
            <p className="text-red-600 dark:text-red-400 font-bold mb-2">KEADAAN DARURAT?</p>
            <p className="text-red-800 dark:text-red-200">
              Jika kamu berada dalam kondisi darurat atau memiliki pikiran untuk menyakiti diri sendiri, segera hubungi:
            </p>
            <p className={`text-3xl font-black mt-3 ${headingColor}`}>119 ext. 8</p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1 uppercase font-bold tracking-widest">Layanan Kesehatan Jiwa Indonesia</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
