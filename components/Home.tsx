
import React, { useState, useEffect } from 'react';
import { getDailyAffirmation } from '../services/geminiService';
import { trackAdminContact } from '../services/dbService';

interface HomeProps {
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ onStart }) => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [affirmation, setAffirmation] = useState<string>("");
  const [isLoadingAffirmation, setIsLoadingAffirmation] = useState(true);

  useEffect(() => {
    const loadAffirmation = async () => {
      const text = await getDailyAffirmation();
      setAffirmation(text);
      setIsLoadingAffirmation(false);
    };
    loadAffirmation();
  }, []);

  const openWA = (admin: {name: string, num: string}) => {
    trackAdminContact(admin.name);
    const text = encodeURIComponent("Halo, saya ingin teman bicara langsung...");
    window.open(`https://wa.me/${admin.num}?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col space-y-16 py-4 animate-in fade-in duration-1000">
      
      {/* Daily Affirmation Card */}
      <div className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative p-8 md:p-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/50 dark:border-gray-800 rounded-[2.5rem] text-center space-y-4 shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Pesan Semangat</h2>
          <p className="text-2xl md:text-3xl font-light text-gray-800 dark:text-gray-100 leading-relaxed italic font-serif">
            {isLoadingAffirmation ? "Menenun kata-kata untukmu..." : `"${affirmation}"`}
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.9]">
            Ruang Aman <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600">Untuk Bercerita.</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Tempat di mana setiap emosi divalidasi dan setiap suara didengar tanpa penghakiman.
          </p>
        </div>
        
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-4 px-12 py-6 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-full transition-all hover:scale-105 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_50px_rgba(255,255,255,0.1)] overflow-hidden"
        >
          <span className="text-lg">Mulai Bercerita</span>
          <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </button>
      </section>

      {/* Tim Admin Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2 tracking-tight">
            Teman Bicara <span className="text-blue-500 animate-pulse">●</span>
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Pilih teman yang ingin kamu ajak ngobrol langsung di WhatsApp:</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto px-4">
          {[
            { name: "Admin ALXIE", num: "628194068927", sub: "???", icon: "🧿" },
            { name: "Epy", num: "6281572926951", sub: "Penjaga", icon: "🛡️" },
            { name: "Misteri", num: "6285133763226", sub: "Bayangan", icon: "🌑" },
            { name: "ADMIN Axelia", num: "6283140008929", sub: "Misterius", icon: "✨" },
            { name: "Angel", num: "6288983634264", sub: "Pendengar", icon: "👼" }
          ].map(admin => (
            <button 
              key={admin.name}
              onClick={() => openWA(admin)}
              className={`flex flex-col items-center justify-center p-6 border rounded-2xl transition-all hover:-translate-y-1 shadow-sm group text-center ${['Misteri', 'ADMIN Axelia'].includes(admin.name) ? 'bg-black border-gray-800' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                {admin.icon}
              </div>
              <div>
                <h4 className={`text-[11px] font-bold group-hover:text-blue-500 transition-colors uppercase tracking-widest ${['Misteri', 'ADMIN Axelia'].includes(admin.name) ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{admin.name}</h4>
                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1.5">{admin.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Breathing Tool */}
      <section className="p-12 bg-gray-50 dark:bg-gray-900/20 rounded-[3rem] border border-gray-100 dark:border-gray-800 max-w-3xl mx-auto w-full group">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative flex items-center justify-center h-56 w-56">
            <div className={`absolute inset-0 bg-blue-500/10 rounded-full transition-transform duration-[4000ms] ${isBreathing ? 'scale-150 opacity-40' : 'scale-100 opacity-20'}`}></div>
            <div className={`absolute inset-4 bg-blue-500/20 rounded-full transition-transform duration-[4000ms] delay-500 ${isBreathing ? 'scale-125 opacity-30' : 'scale-100 opacity-10'}`}></div>
            
            <button 
              onClick={() => setIsBreathing(!isBreathing)}
              className="relative z-20 h-32 w-32 bg-white dark:bg-blue-600 rounded-full shadow-2xl flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              <span className="text-4xl mb-1">{isBreathing ? '🧘' : '🌬️'}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-white">
                {isBreathing ? 'Rileks' : 'Napas'}
              </span>
            </button>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Tenangkan Pikiran Sejenak</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Gunakan latihan napas ini untuk membantu menenangkan diri sebelum menuangkan ceritamu.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            title: "Peer Support", 
            desc: "Dukungan emosional dari sesama yang peduli.", 
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          },
          { 
            title: "Privasi Terjaga", 
            desc: "Data tersimpan aman di perangkatmu sendiri.", 
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          },
          { 
            title: "Kapan Saja", 
            desc: "ALXIE siap mendengarkan 24/7 saat kamu butuh.", 
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          }
        ].map((f, i) => (
          <div key={i} className="p-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="text-blue-600 dark:text-blue-400 mb-6">{f.icon}</div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
