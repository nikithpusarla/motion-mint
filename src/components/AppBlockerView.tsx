import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Dumbbell,
  Lock,
  Shield,
  Unlock,
  X,
  Zap,
} from 'lucide-react';
import { appBlockerService } from '../services/appBlockerService';
import { repository } from '../services/storageRepository';
import { BlockedApp } from '../types';
import { BrandLogo } from './BrandLogo';

interface AppBlockerViewProps {
  app: BlockedApp;
  onClose: () => void;
  onEarnScreenTime: () => void;
  onOpenEmergencyBypass: () => void;
}

export const AppBlockerView: React.FC<AppBlockerViewProps> = ({
  app,
  onClose,
  onEarnScreenTime,
  onOpenEmergencyBypass,
}) => {
  const wallet = repository.getWallet();
  const walletMinutes = Math.floor(wallet.balanceSeconds / 60);
  const multiplier = appBlockerService.getDynamicCostMultiplier(app);
  const costFor5Min = Math.round(5 * multiplier);

  const handleUnlockWithBalance = () => {
    const success = appBlockerService.unlockAppWithEarnedTime(app.packageId, 5);
    if (!success) {
      alert('Insufficient wallet balance for this rate factor. Please complete an activity first.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#FF3B30]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#00FF85]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close / Dismiss */}
        <button
          id="close-blocker-overlay-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#86868B] hover:text-white transition-colors cursor-pointer border border-white/[0.08]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Guardian & Lock Symbol */}
        <div className="flex flex-col items-center justify-center space-y-2 pt-2">
          <BrandLogo size="lg" showText={false} showBadge={false} />
          <span className="text-[11px] font-mono font-semibold tracking-wider text-[#30D158] uppercase">
            Motion Mint App Guardian
          </span>
        </div>

        {/* App Title & Lock Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] text-xs font-semibold font-mono">
            <span>Risk Tier: {app.riskTier?.replace('_', ' ').toUpperCase() || 'STANDARD'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
            🔒 {app.name} is Locked
          </h2>

          <p className="text-sm text-[#888888] max-w-xs mx-auto">
            {walletMinutes > 0 ? (
              <>
                You have <span className="text-[#00FF85] font-bold">{walletMinutes} minutes</span> in your Screen Time Wallet.
              </>
            ) : (
              <>
                You have <span className="text-[#FF3B30] font-bold">0 minutes available</span>. Complete an activity to earn screen time.
              </>
            )}
          </p>
        </div>

        {/* Dynamic Pricing Rate Card */}
        {multiplier > 1.0 && (
          <div className="p-3 bg-[#FF9500]/10 border border-[#FF9500]/30 rounded-2xl text-left flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF9500]/20 text-[#FF9500]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#FF9500]">
                Dopamine Surge Friction ({multiplier}x Rate)
              </div>
              <div className="text-xs text-[#CCCCCC]">
                5 min screen time costs <strong>{costFor5Min} min balance</strong> (night/doomscroll surge).
              </div>
            </div>
          </div>
        )}

        {/* Wallet Balance Card */}
        <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] text-left flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#888888]">
                Wallet Available
              </div>
              <div className="font-display font-bold text-base text-[#00FF85]">
                {walletMinutes} minutes
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-[#888888]">
              Used Today
            </div>
            <div className="font-mono text-xs text-[#CCCCCC]">
              {app.usedTodayMinutes}m / {app.dailyAllowanceMinutes}m
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Unlock with Balance button */}
          {walletMinutes >= costFor5Min && (
            <button
              id="unlock-app-session-btn"
              onClick={handleUnlockWithBalance}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00FF85] to-[#00A3FF] hover:opacity-95 text-black font-bold text-sm tracking-wide shadow-lg shadow-[#00FF85]/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
            >
              <Unlock className="w-4 h-4" /> Unlock 5 Minutes (Costs {costFor5Min}m balance)
            </button>
          )}

          {/* Primary CTA: Earn Screen Time */}
          <button
            id="earn-screen-time-cta-btn"
            onClick={() => {
              onClose();
              onEarnScreenTime();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-[#00FF85] hover:bg-[#00e676] text-black font-bold text-sm tracking-wide shadow-lg shadow-[#00FF85]/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
          >
            <Dumbbell className="w-4 h-4" /> Earn Screen Time Now <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Emergency Option */}
          <button
            id="emergency-access-btn"
            onClick={onOpenEmergencyBypass}
            className="w-full py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-[#181818] text-[#888888] hover:text-[#FF9500] border border-[#222222] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Emergency Bypass Access
          </button>
        </div>
      </div>
    </div>
  );
};
