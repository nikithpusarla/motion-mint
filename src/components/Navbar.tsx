import React from 'react';
import {
  Camera,
  Flame,
  Shield,
  Smartphone,
  Trophy,
  Wallet,
  Code2,
  RotateCcw,
} from 'lucide-react';
import { ScreenTimeWallet, UserProfile } from '../types';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  user: UserProfile;
  wallet: ScreenTimeWallet;
  onOpenSimulator: () => void;
  onOpenLedger: () => void;
  onOpenChallenges: () => void;
  onOpenArchitecture: () => void;
  onOpenAICameraProof: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  wallet,
  onOpenSimulator,
  onOpenLedger,
  onOpenChallenges,
  onOpenArchitecture,
  onOpenAICameraProof,
  onResetData,
}) => {
  const availableMinutes = Math.floor(wallet.balanceSeconds / 60);
  const currentLevelProgressXP = user.xp % 200;
  const xpPercent = Math.min(100, Math.round((currentLevelProgressXP / 200) * 100));

  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Apple HIG Brand Identity with Creative 3D Motion Mint Logo */}
        <BrandLogo size="sm" />

        {/* Live Apple HUD Stats & Action Pills */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* AI Camera Proof Direct Launch Button */}
          <button
            id="nav-ai-camera-btn"
            onClick={onOpenAICameraProof}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#30D158]/15 hover:bg-[#30D158]/25 border border-[#30D158]/40 text-[#30D158] hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-[#30D158]/15 active:scale-[0.97]"
            title="Snap AI Camera Proof for physical exercises, books, journals & offline habits"
          >
            <Camera className="w-4 h-4 text-[#30D158] animate-pulse" />
            <span className="font-medium">AI Camera</span>
          </button>

          {/* Wallet Balance Pill */}
          <button
            id="wallet-pill-btn"
            onClick={onOpenLedger}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-white transition-all cursor-pointer group active:scale-[0.97]"
            title="Click to view Screen Time Wallet & Audit Ledger"
          >
            <div className="w-2 h-2 rounded-full bg-[#30D158] animate-ping opacity-75" />
            <div className="text-left flex items-baseline gap-1">
              <span className="font-display font-bold text-sm text-white tracking-tight">
                {availableMinutes}
              </span>
              <span className="text-[11px] font-normal text-[#30D158]">min</span>
            </div>
          </button>

          {/* Daily Streak Pill */}
          <button
            id="streak-pill-btn"
            onClick={onOpenChallenges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF9F0A]/10 hover:bg-[#FF9F0A]/20 border border-[#FF9F0A]/25 text-[#FF9F0A] transition-all cursor-pointer active:scale-[0.97]"
            title="Daily Activity Streak"
          >
            <Flame className="w-3.5 h-3.5 text-[#FF9F0A]" />
            <span className="font-display font-semibold text-xs text-white">
              {user.streak} <span className="text-[10px] text-[#FF9F0A] font-normal">days</span>
            </span>
          </button>

          {/* Level / XP Pill */}
          <button
            id="level-pill-btn"
            onClick={onOpenChallenges}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#F5F5F7] transition-all cursor-pointer active:scale-[0.97]"
            title={`Level ${user.level} (${user.xp} XP total)`}
          >
            <Trophy className="w-3.5 h-3.5 text-[#0A84FF]" />
            <div className="text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium text-[#86868B] leading-none">
                  Lvl {user.level}
                </span>
                <span className="text-[10px] text-[#0A84FF] font-mono font-medium">
                  {currentLevelProgressXP}/200
                </span>
              </div>
              <div className="w-16 bg-white/[0.08] h-1 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-gradient-to-r from-[#0A84FF] to-[#30D158] h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Phone Simulator Launcher */}
          <button
            id="open-android-simulator-btn"
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black font-semibold text-xs shadow-md shadow-white/10 hover:bg-[#E5E5EA] transition-all cursor-pointer active:scale-[0.97]"
          >
            <Smartphone className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Phone Simulator</span>
          </button>

          {/* Architecture / ML Spec */}
          <button
            id="open-architecture-btn"
            onClick={onOpenArchitecture}
            className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#86868B] hover:text-[#FFFFFF] border border-white/[0.08] transition-colors cursor-pointer active:scale-[0.95]"
            title="View Android Architecture & ML Integration Spec"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Reset Demo Data */}
          <button
            id="reset-demo-data-btn"
            onClick={onResetData}
            className="p-2 rounded-full bg-white/[0.04] hover:bg-[#FF453A]/15 text-[#86868B] hover:text-[#FF453A] border border-white/[0.08] hover:border-[#FF453A]/30 transition-colors cursor-pointer active:scale-[0.95]"
            title="Reset All Local Data & Restart Onboarding"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
