
import React, { useState } from 'react';
import { trackAdminContact } from '../services/dbService';

interface ContactProps {
  isDarkMode: boolean;
}

const MOODS = [
  { id: 'sad', label: 'Sedih', emoji: '😢' },
  { id: 'anxious', label: 'Cemas', emoji: '😰' },
  { id: 'angry', label: 'Marah', emoji: '😡' },
  { id: 'tired', label: 'Lelah', emoji: '😫' },
  { id: 'lonely', label: 'Sepi', emoji: '☁️' },
];

const Contact: React.FC<ContactProps> = ({ isDarkMode }) => {
  const [selectedMoods, setSelectedMoods] = useState<Record<string, string>>({});

  const cardBg = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm';
  const textColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const headingColor = isDarkMode ? 'text-white' : 'text-gray-900';

  const admins = [
    { name: 'Admin ALXIE', phone: '628194068927', sub: '???', icon: '🧿' },
    { name: 'Epy', phone: '6281572926951', sub: 'Penjaga', icon: '🛡️' },
    { name: 'Misteri', phone: '6285133763226', sub: 'Bayangan', icon: '🌑' },
    { name: 'ADMIN Axelia', phone: '6283140008929', sub: 'Misterius', icon: '✨' },
    { name: 'Angel', phone: '6288983634264', sub: 'Pendengar', icon: '👼' }
  ];

  const handleContact = (admin: typeof admins[0]) => {
    const mood = selectedMoods[admin.name] || 'none';
    
    // Simpan catatan mood ke localStorage sesuai permintaan
    try {
      const logs = JSON.parse(localStorage.getItem('admin_contact_moods') || '[]');
      logs.push({
        admin: admin.name,
        mood: mood,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('admin_contact_moods', JSON.stringify(logs));
    } catch (e) {
      console.error("Gagal menyimpan mood kontak", e);
    }

    trackAdminContact(admin.name);
    
    const text = mood !== 'none' 
      ? encodeURIComponent(`Halo ${admin.name}, aku sedang merasa ${mood}. Boleh kita mengobrol?`)
      : encodeURIComponent(`Halo ${admin.name}, aku ingin teman bicara...`);
      
    window.open(`https://wa.me/${admin.phone}?text=${text}`, '_blank');
  };

  const selectMood = (adminName: string, moodId: string) => {
    setSelectedMoods(prev => ({
      ...prev,
      [adminName]: moodId
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h2 className={`text-3xl font-bold ${headingColor} mb-2`}>Teman Bicara</h2>
      <p className={`${textColor} mb-8`}>Kami di sini untuk mendengarkan. Pilih teman yang membuatmu merasa paling aman untuk mengobrol.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {admins.map((admin, idx) => (
          <div key={idx} className={`${admin.name === 'Misteri' || admin.name === 'ADMIN Axelia' ? 'bg-black border-gray-800' : cardBg} border rounded-2xl p-6 space-y-4 hover:border-blue-500/50 transition-all group shadow-sm flex flex-col items-center text-center`}>
            <div className="text-4xl mb-2 filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110">
               {admin.icon}
            </div>
            <div>
              <h3 className={`text-[12px] font-bold ${admin.name === 'Misteri' || admin.name === 'ADMIN Axelia' ? 'text-white' : headingColor} group-hover:text-blue-600 transition-colors leading-tight uppercase tracking-widest`}>{admin.name}</h3>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">{admin.sub}</p>
            </div>

            {/* Mood Selector Grid */}
            <div className="w-full pt-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-3">Apa moodmu saat ini?</p>
              <div className="flex justify-center gap-1.5">
                {MOODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => selectMood(admin.name, m.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      selectedMoods[admin.name] === m.id 
                        ? 'bg-blue-600 border-blue-600 scale-110' 
                        : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    title={m.label}
                  >
                    <span className="text-sm">{m.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => handleContact(admin)}
              className={`w-full text-center px-4 py-3 text-white text-[9px] font-bold rounded-xl transition-all hover:scale-105 shadow-md ${admin.name === 'Misteri' || admin.name === 'ADMIN Axelia' ? 'bg-gray-800 hover:bg-white hover:text-black' : 'bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700'} uppercase tracking-[0.2em]`}
            >
              Hubungi
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-8 rounded-[2rem]">
        <h4 className={`font-bold mb-2 ${headingColor}`}>Tentang Relawan Kami</h4>
        <p className={`text-sm ${textColor} italic leading-relaxed`}>
          "Relawan kami adalah individu yang peduli dengan kesehatan mental. Kami bukan tenaga profesional, namun kami berjanji akan menjadi teman bicara yang baik dan menjaga rahasiamu sekuat tenaga."
        </p>
      </div>
    </div>
  );
};

export default Contact;
