import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Compass,
  Flame,
  Heart,
  Home,
  Instagram,
  Lock,
  MessageCircle,
  Play,
  RotateCcw,
  Search,
  Share2,
  Shield,
  Smartphone,
  Sparkles,
  Unlock,
  Video,
  Volume2,
  X,
  Youtube,
} from 'lucide-react';
import { appBlockerService } from '../services/appBlockerService';
import { repository } from '../services/storageRepository';
import { BlockedApp } from '../types';
import { BrandLogo } from './BrandLogo';

interface AndroidSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: () => void;
  onOpenEmergency: () => void;
  onOpenAICameraProof?: () => void;
}

export const AndroidSimulatorModal: React.FC<AndroidSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  onOpenEmergency,
  onOpenAICameraProof,
}) => {
  const [runningApp, setRunningApp] = useState<BlockedApp | null>(null);
  const [isOverlayLocked, setIsOverlayLocked] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);

  const apps = repository.getApps();
  const wallet = repository.getWallet();

  // Subscribe to blocker service
  useEffect(() => {
    const unsub = appBlockerService.subscribe((activeApp, isBlocked) => {
      setRunningApp(activeApp);
      setIsOverlayLocked(isBlocked);
    });
    return () => unsub();
  }, []);

  // Update countdown display every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (runningApp && runningApp.isCurrentlyUnlocked && runningApp.sessionStartTime) {
        const elapsed = Math.floor((Date.now() - runningApp.sessionStartTime) / 1000);
        const rem = Math.max(0, runningApp.sessionDurationSeconds - elapsed);
        setTimeRemainingSeconds(rem);
      } else {
        setTimeRemainingSeconds(0);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [runningApp]);

  if (!isOpen) return null;

  const handleLaunchApp = (pkgId: string) => {
    const result = appBlockerService.attemptLaunchApp(pkgId);
    setRunningApp(result.app);
    setIsOverlayLocked(!result.allowed);
  };

  const handleUnlockWithEarned = () => {
    if (!runningApp) return;
    const ok = appBlockerService.unlockAppWithEarnedTime(runningApp.packageId, 5);
    if (!ok) {
      alert('You have 0 minutes available. Complete an activity first.');
    }
  };

  const handleGoHome = () => {
    setRunningApp(null);
    setIsOverlayLocked(false);
    appBlockerService.closeActiveApp();
  };

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="flex flex-col items-center">
        {/* Device Frame */}
        <div className="relative w-[340px] sm:w-[380px] h-[700px] sm:h-[740px] bg-[#050505] rounded-[52px] p-3.5 shadow-2xl border-4 border-white/[0.12] ring-1 ring-white/[0.08] flex flex-col justify-between overflow-hidden">
          {/* Dynamic Island Pill */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-3 border border-white/[0.12] shadow-md">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1C1C1E] border border-white/[0.1] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0A84FF]/40" />
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
              <span className="text-[9px] font-mono text-white/80">Active</span>
            </div>
          </div>

          {/* Status Bar */}
          <div className="w-full pt-1.5 px-6 flex items-center justify-between text-[11px] text-[#86868B] font-mono z-20 select-none">
            <span className="font-semibold text-white">09:41</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-4 h-2 rounded-sm border border-[#86868B] p-0.5 flex items-center">
                <div className="w-full h-full bg-[#30D158] rounded-2xs" />
              </div>
            </div>
          </div>

          {/* SCREEN DISPLAY AREA */}
          <div className="flex-1 w-full bg-[#000000] rounded-[38px] overflow-hidden relative flex flex-col mt-2 mb-2 select-none border border-white/[0.08]">
            {/* 1. HOME SCREEN STATE */}
            {!runningApp && (
              <div className="flex-1 p-5 flex flex-col justify-between bg-gradient-to-b from-[#121214] via-[#09090B] to-[#000000]">
                {/* Top Focus Widget */}
                <div className="space-y-4 pt-6">
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-left shadow-lg backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <BrandLogo size="xs" showText={false} showBadge={false} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">
                          MotionMint Guardian
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#30D158] bg-[#30D158]/10 px-2.5 py-0.5 rounded-full border border-[#30D158]/30 font-bold">
                        {Math.floor(wallet.balanceSeconds / 60)}m Pool
                      </span>
                    </div>
                    <p className="text-[11px] text-[#86868B] mt-1.5 leading-relaxed">
                      Tap any restricted app below to test the automatic blocking and verified session countdown loop.
                    </p>
                  </div>
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-3 gap-4 text-center my-auto px-2">
                  {apps.map((app) => (
                    <button
                      key={app.packageId}
                      type="button"
                      onClick={() => handleLaunchApp(app.packageId)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/[0.04] transition-all active:scale-90 cursor-pointer group"
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative transition-transform group-hover:scale-105 ${
                          app.packageId.includes('instagram')
                            ? 'bg-gradient-to-tr from-[#FF9500] via-[#FF2D55] to-[#AF52DE] text-white'
                            : app.packageId.includes('youtube')
                            ? 'bg-[#FF3B30] text-white'
                            : app.packageId.includes('musically')
                            ? 'bg-[#000000] border border-white/[0.2] text-[#00F2FE]'
                            : app.packageId.includes('snapchat')
                            ? 'bg-[#FFCC00] text-black'
                            : app.packageId.includes('reddit')
                            ? 'bg-[#FF4500] text-white'
                            : 'bg-[#1C1C1E] text-white'
                        }`}
                      >
                        {app.packageId.includes('instagram') && <Instagram className="w-7 h-7" />}
                        {app.packageId.includes('youtube') && <Youtube className="w-7 h-7" />}
                        {app.packageId.includes('musically') && <Video className="w-7 h-7" />}
                        {app.packageId.includes('snapchat') && <Camera className="w-7 h-7" />}
                        {app.packageId.includes('reddit') && <Compass className="w-7 h-7" />}
                        {app.packageId.includes('twitter') && <Share2 className="w-7 h-7" />}

                        {/* Lock Badge */}
                        {app.isBlocked && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1C1C1E] border border-[#FF453A]/40 flex items-center justify-center text-[#FF453A] shadow">
                            <Lock className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-[#E5E5EA] group-hover:text-[#30D158] transition-colors">
                        {app.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Dock Bar */}
                <div className="bg-white/[0.04] backdrop-blur-2xl p-2 rounded-3xl border border-white/[0.08] flex justify-between items-center gap-2">
                  <button
                    onClick={onSelectExercise}
                    className="flex-1 py-2.5 px-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold flex items-center justify-center gap-1.5 text-[11px] transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#30D158]" /> Exercises
                  </button>

                  {onOpenAICameraProof && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAICameraProof();
                      }}
                      className="flex-1 py-2.5 px-3 rounded-full bg-[#30D158] hover:bg-[#30D158]/90 text-black font-semibold flex items-center justify-center gap-1.5 text-[11px] shadow-sm cursor-pointer transition-transform active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" /> AI Camera
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 2. RUNNING APP STATE (When Unlocked) */}
            {runningApp && !isOverlayLocked && (
              <div className="flex-1 flex flex-col bg-[#000000] relative overflow-hidden">
                {/* Floating Active Countdown Timer HUD */}
                <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-black/80 backdrop-blur-xl border border-[#30D158]/40 text-[#30D158] px-3.5 py-1.5 rounded-full font-mono text-xs shadow-xl">
                  <div className="w-2 h-2 rounded-full bg-[#30D158] animate-ping" />
                  <span className="font-bold">{formatCountdown(timeRemainingSeconds)}</span>
                </div>

                {/* Simulated Instagram */}
                {runningApp.packageId.includes('instagram') && (
                  <div className="flex-1 flex flex-col bg-[#000000] text-white overflow-y-auto">
                    <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
                      <span className="font-semibold text-sm tracking-tight">Instagram</span>
                      <div className="w-6" />
                    </div>
                    {/* Post */}
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5">
                          <div className="w-full h-full bg-[#111111] rounded-full" />
                        </div>
                        <span className="text-xs font-semibold">fit_creator</span>
                      </div>
                      <div className="aspect-square bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center text-[#86868B] text-xs font-medium">
                        [📸 Active Screen Time Session]
                      </div>
                      <div className="flex gap-3 text-[#86868B]">
                        <Heart className="w-4 h-4 text-[#FF453A] fill-current" />
                        <MessageCircle className="w-4 h-4" />
                        <Share2 className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] text-[#86868B] leading-relaxed">
                        <span className="font-semibold text-white mr-1">fit_creator</span> Unlocked with 20 pushups! Focus &amp; fitness gamification works.
                      </p>
                    </div>
                  </div>
                )}

                {/* Simulated YouTube */}
                {runningApp.packageId.includes('youtube') && (
                  <div className="flex-1 flex flex-col bg-[#000000] text-white">
                    <div className="aspect-video bg-red-950/20 border-b border-white/[0.08] flex flex-col items-center justify-center text-center p-4">
                      <Play className="w-10 h-10 text-[#FF453A] fill-current mb-2" />
                      <span className="text-xs font-semibold">YouTube Video Stream Playing</span>
                      <span className="text-[10px] text-[#86868B]">Session countdown active</span>
                    </div>
                    <div className="p-3.5 space-y-1.5">
                      <h4 className="text-xs font-semibold">How To Build Real Discipline In 30 Days</h4>
                      <p className="text-[10px] text-[#86868B]">1.2M views • 2 days ago</p>
                    </div>
                  </div>
                )}

                {/* Fallback Simulated App (Reddit, TikTok, etc.) */}
                {!runningApp.packageId.includes('instagram') && !runningApp.packageId.includes('youtube') && (
                  <div className="flex-1 p-5 bg-[#000000] flex flex-col justify-center items-center text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#30D158]">
                      <Unlock className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{runningApp.name} Active</h3>
                      <p className="text-[11px] text-[#86868B] mt-1 leading-relaxed">
                        Unlocked via MotionMint. When countdown reaches 00:00, app will re-lock.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. SIMULATOR BLOCKER OVERLAY STATE (When Blocked) */}
            {runningApp && isOverlayLocked && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl p-6 flex flex-col justify-between text-center z-40">
                <div className="space-y-4 pt-10">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/30 flex items-center justify-center text-[#FF453A] shadow-xl">
                    <Lock className="w-8 h-8 animate-pulse" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {runningApp.name} is Locked
                    </h3>
                    <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
                      {wallet.balanceSeconds > 0
                        ? `You have ${Math.floor(wallet.balanceSeconds / 60)}m earned balance in your wallet.`
                        : 'You have 0 minutes available. Complete an activity or verify with camera to earn screen time.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pb-4">
                  {wallet.balanceSeconds >= 60 ? (
                    <button
                      id="sim-unlock-btn"
                      onClick={handleUnlockWithEarned}
                      className="w-full py-3 rounded-full bg-[#30D158] hover:bg-[#30D158]/90 text-black font-semibold text-xs transition-transform active:scale-95 cursor-pointer shadow-lg shadow-[#30D158]/20"
                    >
                      Unlock 5 Min ({Math.floor(wallet.balanceSeconds / 60)}m in Wallet)
                    </button>
                  ) : null}

                  <button
                    id="sim-earn-btn"
                    onClick={() => {
                      onClose();
                      onSelectExercise();
                    }}
                    className="w-full py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-xs border border-white/[0.1] transition-transform active:scale-95 cursor-pointer"
                  >
                    Earn Screen Time Now
                  </button>

                  <button
                    id="sim-emergency-btn"
                    onClick={() => {
                      onClose();
                      onOpenEmergency();
                    }}
                    className="w-full py-2 text-[#86868B] hover:text-[#FF9F0A] text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Emergency Bypass Access
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bar Home Indicator */}
          <div className="w-full py-2 flex justify-center items-center z-20">
            <button
              id="android-home-bar-btn"
              onClick={handleGoHome}
              className="w-32 h-1 bg-white/30 hover:bg-white/60 rounded-full transition-colors cursor-pointer"
              title="Home Gesture"
            />
          </div>
        </div>

        {/* Dismiss Simulator Overlay */}
        <button
          id="close-device-simulator-btn"
          onClick={onClose}
          className="mt-4 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#86868B] hover:text-white text-xs font-medium border border-white/[0.08] cursor-pointer flex items-center gap-2 transition-all active:scale-95"
        >
          <X className="w-4 h-4" /> Close Phone Simulator
        </button>
      </div>
    </div>
  );
};
