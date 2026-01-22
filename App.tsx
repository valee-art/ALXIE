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

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // Pengecekan kunci yang lebih aman untuk berbagai platform deploy
  const apiKey = process.env.API_KEY;
  const hasKey = !!apiKey && apiKey !== "" && apiKey !== "undefined";
  
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-black text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {currentPage === Page.Home && <Home onStart={() => setCurrentPage(Page.Venting)} />}
        {currentPage === Page.Venting && <VentingForm />}
        {currentPage === Page.Journal && <Journal />}
        {currentPage === Page.Community && <Community />}
        {currentPage === Page.Contact && <Contact isDarkMode={isDarkMode} />}
        {currentPage === Page.Disclaimer && <Disclaimer isDarkMode={isDarkMode} />}
      </main>

      <Footer onNavigate={setCurrentPage} isDarkMode={isDarkMode} />
      
      {/* Status Indicator Floating Badge */}
      <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-500 ${isOnline && hasKey ? 'bg-black/60 border-green-500/50' : 'bg-red-950/80 border-red-500/50'}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline && hasKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
            {isOnline ? (hasKey ? 'ALXIE ONLINE' : 'AI KEY MISSING') : 'OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;