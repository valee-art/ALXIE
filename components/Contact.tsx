
import React from 'react';

interface ContactProps {
  isDarkMode: boolean;
}

const Contact: React.FC<ContactProps> = ({ isDarkMode }) => {
  const cardBg = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm';
  const textColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const headingColor = isDarkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className={`text-3xl font-bold ${headingColor} mb-6`}>Hubungi Kami</h2>
      <div className={`${cardBg} border rounded-2xl p-8 space-y-6 transition-colors`}>
        <p className={`${textColor} leading-relaxed`}>
          Jika kamu memiliki pertanyaan, masukan, atau hanya ingin mengobrol satu sama lain, kamu bisa menghubungi admin ALXIE melalui WhatsApp.
        </p>

        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1 uppercase tracking-wider">WhatsApp Admin ALXIE</p>
          <a 
            href="https://wa.me/628194068927" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`text-2xl font-bold ${headingColor} hover:text-blue-600 transition-colors block`}
          >
            +62 819-4068-927
          </a>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-4 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-500 italic">
            "Kontak ini bersifat opsional dan tidak selalu tersedia. ALXIE bukan layanan profesional atau darurat."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
