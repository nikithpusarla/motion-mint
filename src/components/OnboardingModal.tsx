import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  Flame,
  Gift,
  Lock,
  Shield,
  Sparkles,
  Smartphone,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { soundService } from '../services/audioService';
import { repository } from '../services/storageRepository';
import { BlockedApp } from '../types';
import { BrandLogo } from './BrandLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('Alex Mercer');
  const [email, setEmail] = useState('alex.mercer@student.edu');
  const [selectedPackages, setSelectedPackages] = useState<string[]>([
    'com.instagram.android',
    'com.google.android.youtube',
    'com.zhiliaoapp.musically',
    'com.snapchat.android',
    'com.reddit.frontpage',
  ]);

  if (!isOpen) return null;

  const apps = repository.getApps();

  const handleClaimWelcomeGift = () => {
    soundService.playSuccessChime();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setStep(3);
  };

  const togglePackage = (pkg: string) => {
    if (selectedPackages.includes(pkg)) {
      setSelectedPackages(selectedPackages.filter((p) => p !== pkg));
    } else {
      setSelectedPackages([...selectedPackages, pkg]);
    }
  };

  const handleFinishOnboarding = () => {
    // 1. Update user profile
    repository.updateUser({
      name: name.trim() || 'Alex Mercer',
      email: email.trim() || 'alex.mercer@student.edu',
      onboardingCompleted: true,
    });

    // 2. Set blocked status for all apps according to user choice
    apps.forEach((app) => {
      repository.updateApp(app.packageId, {
        isBlocked: selectedPackages.includes(app.packageId),
      });
    });

    soundService.playSuccessChime();
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 },
    });

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
        {/* Step Progress Dots */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/30 flex items-center justify-center font-bold font-mono text-xs">
              0{step}
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#888888]">
              {step === 1 && 'Account Setup'}
              {step === 2 && 'Welcome Screen Time'}
              {step === 3 && 'App Cage Selection'}
              {step === 4 && 'Activate Core Loop'}
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-[#00FF85]' : s < step ? 'w-2 bg-[#00A3FF]' : 'w-2 bg-[#222222]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Account Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center flex flex-col items-center space-y-3">
              <BrandLogo size="hero" showText={false} showBadge={false} />
              <div>
                <h2 className="text-2xl font-bold font-display text-white tracking-tight">
                  Welcome to Motion Mint
                </h2>
                <p className="text-sm text-[#86868B] max-w-md mx-auto mt-1">
                  Break free from endless doomscrolling. Reclaim focus by minting social media time through physical motion and mental exercises.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <input
                  id="onboarding-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#111111] border border-[#222222] rounded-xl text-white focus:outline-none focus:border-[#00FF85] transition-colors text-sm"
                  placeholder="e.g. Alex Mercer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CCCCCC] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  id="onboarding-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#111111] border border-[#222222] rounded-xl text-white focus:outline-none focus:border-[#00FF85] transition-colors text-sm"
                  placeholder="e.g. alex.mercer@student.edu"
                />
              </div>
            </div>

            <button
              id="onboarding-step1-next-btn"
              onClick={() => setStep(2)}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00FF85] to-[#00A3FF] text-black font-bold text-sm tracking-wide shadow-lg shadow-[#00FF85]/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: 30-Minute Welcome Gift */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#00FF85]/10 border border-[#00FF85]/30 flex items-center justify-center text-[#00FF85] shadow-xl shadow-[#00FF85]/10 animate-pulse">
              <Gift className="w-10 h-10 text-[#00FF85]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-[#FF9500] bg-[#FF9500]/10 px-3 py-1 rounded-full border border-[#FF9500]/30">
                New User Initiation Gift
              </span>
              <h2 className="text-3xl font-black font-display text-white">
                +30 Minutes Screen Time
              </h2>
              <p className="text-sm text-[#888888] max-w-md mx-auto">
                We seed your Screen Time Wallet with an initial 30-minute credit to experience the unlocking loop immediately.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] text-left flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-[#00FF85]/10 text-[#00FF85]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#CCCCCC]">
                <span className="font-semibold text-white">Rule #1:</span> Screen time is stored in your secure wallet. When you launch a blocked app, the countdown runs until 0:00, then locks automatically.
              </div>
            </div>

            <button
              id="claim-welcome-gift-btn"
              onClick={handleClaimWelcomeGift}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00FF85] to-[#00A3FF] text-black font-bold text-sm tracking-wide shadow-lg shadow-[#00FF85]/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
            >
              Claim +30 Min Balance <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: App Cage Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display text-white">
                Select Apps to Control
              </h2>
              <p className="text-xs text-[#888888]">
                These applications will be locked by the system until you earn time through verified activities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {apps.map((app) => {
                const isSelected = selectedPackages.includes(app.packageId);
                return (
                  <button
                    key={app.packageId}
                    type="button"
                    onClick={() => togglePackage(app.packageId)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#00FF85]/10 border-[#00FF85]/40 text-white'
                        : 'bg-[#111111] border-[#222222] text-[#888888] hover:border-[#333333]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#050505] flex items-center justify-center border border-[#222222]">
                        <Lock className={`w-4 h-4 ${isSelected ? 'text-[#00FF85]' : 'text-[#666666]'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{app.name}</div>
                        <div className="text-[10px] text-[#666666] font-mono">{app.packageId}</div>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#00FF85] border-[#00FF85] text-black'
                          : 'border-[#333333]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-[#888888] bg-[#111111] p-3 rounded-xl border border-[#222222]">
              <span>{selectedPackages.length} apps will be locked</span>
              <span className="text-[#00FF85] font-semibold">Protected Mode</span>
            </div>

            <button
              id="onboarding-step3-next-btn"
              onClick={() => setStep(4)}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00FF85] to-[#00A3FF] text-black font-bold text-sm tracking-wide shadow-lg shadow-[#00FF85]/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
            >
              Confirm Selection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 4: Ready to Launch */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00FF85]/10 border border-[#00FF85]/30 flex items-center justify-center text-[#00FF85]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-white">
                You&apos;re All Set!
              </h2>
              <p className="text-sm text-[#888888] max-w-md mx-auto">
                Whenever you open a locked app, our blocker will prompt you. Complete 20 pushups or 10 min meditation anytime to unlock screen time.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] text-left space-y-2">
              <div className="text-xs font-semibold text-[#CCCCCC] uppercase tracking-wider">
                Active Core Loop:
              </div>
              <div className="text-xs text-[#888888] space-y-1">
                <p>1. 🔒 Locked apps stay blocked.</p>
                <p>2. 🏋️ Complete Push-ups, Squats, or Meditation.</p>
                <p>3. ⏱️ 5 minutes granted per completed activity.</p>
                <p>4. 🛑 Apps re-lock automatically at 00:00.</p>
              </div>
            </div>

            <button
              id="start-earning-btn"
              onClick={handleFinishOnboarding}
              className="w-full py-3.5 px-6 rounded-xl bg-[#00FF85] hover:bg-[#00e676] text-black font-bold text-sm tracking-wide shadow-lg shadow-[#00FF85]/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-101"
            >
              Enter Dashboard &amp; Start <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
