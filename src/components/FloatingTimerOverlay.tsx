import React, { useEffect, useState } from 'react';
import { Clock, Shield, X, Zap } from 'lucide-react';
import { appBlockerService } from '../services/appBlockerService';
import { repository } from '../services/storageRepository';
import { BlockedApp } from '../types';

export const FloatingTimerOverlay: React.FC = () => {
  const [activeApp, setActiveApp] = useState<BlockedApp | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const checkActiveApp = () => {
      const currentActive = appBlockerService.getActiveApp();
      if (currentActive && currentActive.isCurrentlyUnlocked && currentActive.sessionStartTime) {
        const elapsed = Math.floor((Date.now() - currentActive.sessionStartTime) / 1000);
        const rem = Math.max(0, currentActive.sessionDurationSeconds - elapsed);
        setActiveApp(currentActive);
        setRemainingSeconds(rem);
      } else {
        setActiveApp(null);
      }
    };

    const interval = window.setInterval(checkActiveApp, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!activeApp || remainingSeconds <= 0) {
    return null;
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isCritical = remainingSeconds < 60;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isMinimized ? 'opacity-80 hover:opacity-100 scale-90' : 'scale-100'
      }`}
    >
      <div
        className={`p-3 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 ${
          isCritical
            ? 'bg-[#FF3B30]/90 border-[#FF3B30] text-white animate-pulse'
            : 'bg-[#0A0A0A]/95 border-[#00FF85]/40 text-white'
        }`}
      >
        <div
          className={`p-2 rounded-xl ${
            isCritical ? 'bg-white/20 text-white' : 'bg-[#00FF85]/20 text-[#00FF85]'
          }`}
        >
          <Clock className="w-4 h-4" />
        </div>

        {!isMinimized && (
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
              Active: {activeApp.name}
            </div>
            <div className="font-mono text-sm font-black flex items-center gap-1.5">
              <span>
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] font-normal opacity-80">remaining</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer text-[10px] font-mono px-1.5"
          title={isMinimized ? 'Expand timer' : 'Minimize'}
        >
          {isMinimized ? '▲' : '▼'}
        </button>

        <button
          onClick={() => appBlockerService.closeActiveApp()}
          className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          title="End session now"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
