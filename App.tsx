
import React, { useState, useEffect } from 'react';
import { Page } from './types';
import Navigation from './components/Navigation';
import Home from './components/Home';
import VentingForm from './components/VentingForm';
import Journal from './components/Journal';
import Community from './components/Community';
import Contact from './components/Contact';
import Disclaimer from './components/Disclaimer';
import Footer from './components/Footer';
import { getApiKey } from './services/geminiService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('alxie_theme');
    return saved ? saved === 'dark' : true;
  });
  const [isAIReady, setIsAIReady] = useState(false);

  useEffect(() => {
    localStorage.setItem('alxie_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Periksa apakah API Key terdeteksi
    setIsAIReady(!!getApiKey());
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const quickExit = () => {
    window.location.href = "https://www.google.com";
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home:
        return <Home onStart={() => setCurrentPage(Page.Venting)} />;
      case Page.Venting:
        return <VentingForm />;
      case Page.Journal:
        return <Journal />;
      case Page.Community:
        return <Community />;
      case Page.Contact:
        return <Contact isDarkMode={isDarkMode} />;
      case Page.Disclaimer:
        return <Disclaimer isDarkMode={isDarkMode} />;
      default:
        return <Home onStart={() => setCurrentPage(Page.Venting)} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-black text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <Navigation 
        currentPage={currentPage} 
        onNavigate={(page) => setCurrentPage(page)} 
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-4xl relative">
        <div className="animate-in fade-in duration-700">
          {renderPage()}
        </div>
      </main>

      {/* Floating Status & Quick Actions */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
        <div 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all shadow-lg ${
            isAIReady 
            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}
          title={isAIReady ? "AI ALXIE Siap Mendengarkan" : "AI Belum Terhubung"}
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${isAIReady ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {isAIReady ? "AI Ready" : "AI Offline"}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <button 
          onClick={quickExit}
          className="p-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 active:scale-90 transition-all border-2 border-white/20"
          title="Tutup Cepat (Privasi)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <button 
          onClick={() => window.open(`https://wa.me/628194068927`, '_blank')}
          className="p-4 bg-[#25D366] text-white rounded-full shadow-2xl shadow-green-500/40 hover:scale-110 active:scale-95 transition-all group"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </button>
      </div>

      <Footer onNavigate={(page) => setCurrentPage(page)} isDarkMode={isDarkMode} />
    </div>
  );
};

export default App;
