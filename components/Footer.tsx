
import React, { useState, useRef } from 'react';
import { Page } from '../types';

interface FooterProps {
  onNavigate: (page: Page) => void;
  onAdminAccess: () => void;
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onAdminAccess, isDarkMode }) => {
  const [clickCount, setClickCount] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const bgColor = isDarkMode ? 'bg-black' : 'bg-gray-100';
  const borderColor = isDarkMode ? 'border-gray-900' : 'border-gray-200';
  const textColor = isDarkMode ? 'text-gray-500' : 'text-gray-600';

  const handleSecretClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const nextCount = clickCount + 1;
    
    if (nextCount >= 5) {
      onAdminAccess();
      setClickCount(0);
    } else {
      setClickCount(nextCount);
      // Memberikan waktu 4 detik untuk menyelesaikan 5 klik
      timeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 4000);
    }
  };

  const getLogoColor = () => {
    if (clickCount === 0) return isDarkMode ? 'text-white' : 'text-gray-900';
    if (clickCount === 1) return 'text-indigo-900/50';
    if (clickCount === 2) return 'text-indigo-700';
    if (clickCount === 3) return 'text-indigo-500';
    return 'text-violet-500 animate-pulse';
  };

  return (
    <footer className={`border-t transition-colors duration-300 ${borderColor} ${bgColor} py-12 px-4`}>
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 
              onClick={handleSecretClick}
              className={`text-xl font-bold mb-2 tracking-tighter cursor-default select-none transition-all duration-300 active:opacity-50 ${getLogoColor()}`}
            >
              ALXIE
            </h3>
            <p className={`text-sm max-w-xs ${textColor}`}>
              Ruang dukungan emosional sebaya. Dibuat dengan penuh kasih oleh remaja untuk sesama.
            </p>
          </div>
          
          <div className="flex gap-6">
            <button onClick={() => onNavigate(Page.Disclaimer)} className={`text-xs hover:text-indigo-600 transition-colors ${textColor}`}>Disclaimer</button>
            <button onClick={() => onNavigate(Page.Contact)} className={`text-xs hover:text-indigo-600 transition-colors ${textColor}`}>Kontak</button>
            <span className={`text-xs ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}>|</span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>© 2024 ALXIE</span>
          </div>
        </div>
        
        <div className={`mt-10 pt-6 border-t ${isDarkMode ? 'border-gray-950' : 'border-gray-200'} text-center`}>
          <p className={`text-[10px] uppercase tracking-widest font-medium ${isDarkMode ? 'text-gray-800' : 'text-gray-400'}`}>
            Bukan Layanan Medis • Peer Support Only
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
