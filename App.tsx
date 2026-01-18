
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isAIReady, setIsAIReady] = useState(false);

  useEffect(() => {
    const key = getApiKey();
    setIsAIReady(!!key);
  }, []);

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

      {/* Floating UI status indicator */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
        <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold border ${isAIReady ? 'border-green-500/20 text-green-500' : 'border-red-500/20 text-red-500'}`}>
          {isAIReady ? "AI AKTIF" : "AI ERROR/OFFLINE"}
        </div>
      </div>

      <Footer onNavigate={setCurrentPage} isDarkMode={isDarkMode} />
    </div>
  );
};

export default App;
