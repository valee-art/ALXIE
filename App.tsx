
import React, { useState, useEffect } from 'react';
import { Page } from './types';
import Navigation from './components/Navigation';
import Home from './components/Home';
import VentingForm from './components/VentingForm';
import Reflection from './components/Reflection';
import Journal from './components/Journal';
import Community from './components/Community';
import Contact from './components/Contact';
import Disclaimer from './components/Disclaimer';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // State untuk Admin Login Modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === "ALXIE2024") {
      setIsAdmin(true);
      setCurrentPage(Page.AdminDashboard);
      setShowAdminModal(false);
      setAdminPasscode("");
      setIsError(false);
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 800);
    }
  };

  const apiKey = process.env.API_KEY;
  const hasKey = typeof apiKey === 'string' && apiKey.trim().length > 10;
  
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-black text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {currentPage === Page.Home && <Home onStart={() => setCurrentPage(Page.Venting)} />}
        {currentPage === Page.Venting && <VentingForm />}
        {currentPage === Page.Reflection && <Reflection isAdmin={isAdmin} />}
        {currentPage === Page.Journal && <Journal />}
        {currentPage === Page.Community && <Community />}
        {currentPage === Page.AdminDashboard && <AdminDashboard />}
        {currentPage === Page.Contact && <Contact isDarkMode={isDarkMode} />}
        {currentPage === Page.Disclaimer && <Disclaimer isDarkMode={isDarkMode} />}
      </main>

      <Footer onNavigate={setCurrentPage} onAdminAccess={() => setShowAdminModal(true)} isDarkMode={isDarkMode} />
      
      {/* Custom Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 shadow-2xl p-10 space-y-6 transition-all transform animate-in zoom-in-95 duration-300 ${isError ? 'border-red-500 animate-shake' : 'border-indigo-500/30'}`}>
            <div className="text-center space-y-2">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Admin Verification</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sistem terenkripsi. Masukkan kode akses.</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                autoFocus
                type="password"
                placeholder="••••••••"
                className={`w-full p-4 bg-gray-50 dark:bg-black rounded-2xl border text-center text-xl tracking-[0.5em] outline-none transition-all ${isError ? 'border-red-500 text-red-500' : 'border-gray-200 dark:border-gray-800 focus:border-indigo-500'}`}
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
              />
              
              <div className="flex flex-col gap-2">
                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  Verify Access
                </button>
                <button 
                  type="button"
                  onClick={() => { setShowAdminModal(false); setAdminPasscode(""); setIsError(false); }}
                  className="w-full py-2 text-gray-400 font-bold uppercase tracking-widest text-[9px] hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Status Indicator */}
      <div className="fixed bottom-6 left-6 z-50 pointer-events-none flex flex-col gap-2">
        {isAdmin && (
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-violet-600 border-violet-400 shadow-xl">
             <span className="text-[8px] font-black text-white uppercase tracking-widest">Admin Mode Active</span>
           </div>
        )}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-500 ${isOnline && hasKey ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-red-950/80 border-red-500/50'}`}>
          <div className={`w-2 h-2 rounded-full ${isOnline && hasKey ? 'bg-indigo-400 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
            {isOnline ? (hasKey ? 'ALXIE OPERATIONAL' : 'AI AUTH ERROR') : 'OFFLINE MODE'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
