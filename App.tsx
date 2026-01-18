
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
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const hasKey = process.env.API_KEY && process.env.API_KEY !== "undefined";
  
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
      
      {/* Dynamic Status Indicator */}
      <div className="fixed bottom-4 left-4 z-50 transition-opacity duration-500 opacity-60 hover:opacity-100">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg ${isOnline && hasKey ? 'bg-gray-900 border-green-500/30' : 'bg-red-950 border-red-500/30'}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline && hasKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-[9px] font-black text-white uppercase tracking-widest">
            {isOnline ? (hasKey ? 'ALXIE ONLINE' : 'AI KEY MISSING') : 'OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
