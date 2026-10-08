import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Boxes,
  Brain,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Droplets,
  Dumbbell,
  ExternalLink,
  Flame,
  Flower2,
  Footprints,
  Grid,
  Hash,
  HeartPulse,
  Hourglass,
  Layers,
  Lock,
  LockOpen,
  Palette,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Timer,
  Trees,
  TrendingUp,
  Trophy,
  Unlock,
  UserCheck,
  Wallet,
  Wind,
  Zap,
  Check,
} from 'lucide-react';
import { ActivityIcon, getActivityVisualMeta } from './ActivityIcon';
import { BrandLogo } from './BrandLogo';
import { AI_PROOF_HABITS } from '../services/aiVerificationService';
import { INITIAL_ACTIVITIES } from '../services/storageRepository';
import {
  Achievement,
  ActivityDefinition,
  BlockedApp,
  Challenge,
  ExerciseType,
  ScreenTimeTransaction,
  ScreenTimeWallet,
  UserProfile,
} from '../types';

export interface RewindStepFlowProps {
  user: UserProfile;
  wallet: ScreenTimeWallet;
  apps: BlockedApp[];
  activities: ActivityDefinition[];
  challenges: Challenge[];
  achievements: Achievement[];
  transactions: ScreenTimeTransaction[];
  onSelectActivity: (exerciseType: ExerciseType) => void;
  onLaunchApp: (packageId: string) => void;
  onToggleAppBlock: (packageId: string) => void;
  onOpenLedger: () => void;
  onOpenChallenges: () => void;
  onOpenSimulator: () => void;
  onOpenEmergency: () => void;
  onOpenAICameraProof: () => void;
}

const CHAPTERS = [
  {
    id: 1,
    title: 'Screen Time Rewind',
    shortLabel: '01. Rewind Audit',
    subtitle: 'Daily attention breakdown & activity ring telemetry',
    icon: Clock,
    color: '#0A84FF',
  },
  {
    id: 2,
    title: 'Guardian App Locker',
    shortLabel: '02. App Lock',
    subtitle: 'Select and intercept addictive doomscrolling apps',
    icon: Shield,
    color: '#FF453A',
  },
  {
    id: 3,
    title: 'Motion & Mind Minting',
    shortLabel: '03. Mint Quests',
    subtitle: 'Choose physical reps, cognitive puzzles, or offline habits',
    icon: Zap,
    color: '#30D158',
  },
  {
    id: 4,
    title: 'AI Proof & Gemini Referee',
    shortLabel: '04. AI Verification',
    subtitle: 'Multimodal vision validation with zero manual cheating',
    icon: Camera,
    color: '#BF5AF2',
  },
  {
    id: 5,
    title: 'Time Vault & Ledger',
    shortLabel: '05. Vault & Streaks',
    subtitle: 'Minted minutes balance, streak multiplier, and ledger',
    icon: Wallet,
    color: '#FF9F0A',
  },
  {
    id: 6,
    title: 'Phone Simulator & Session',
    shortLabel: '06. Phone Sim',
    subtitle: 'Interactive live device session with Dynamic Island HUD',
    icon: Smartphone,
    color: '#64D2FF',
  },
];

export const RewindStepFlow: React.FC<RewindStepFlowProps> = ({
  user,
  wallet,
  apps,
  activities,
  challenges,
  achievements,
  transactions,
  onSelectActivity,
  onLaunchApp,
  onToggleAppBlock,
  onOpenLedger,
  onOpenChallenges,
  onOpenSimulator,
  onOpenEmergency,
  onOpenAICameraProof,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<'all' | 'physical' | 'mental'>('all');

  const availableMinutes = Math.floor(wallet.balanceSeconds / 60);
  const totalEarnedMinutes = Math.floor(wallet.totalEarnedSeconds / 60);
  const totalSpentMinutes = Math.floor(wallet.totalUsedSeconds / 60);

  // Daily Activity Ring calculations
  const dailyGoalMinutes = 30;
  const ring1Percent = Math.min(100, Math.round((totalEarnedMinutes / dailyGoalMinutes) * 100));
  const ring2Percent = Math.min(100, Math.round((user.streak / 7) * 100));
  const ring3Percent = Math.min(100, Math.round(((user.xp % 200) / 200) * 100));

  const totalSteps = CHAPTERS.length;

  const goToStep = (step: number) => {
    if (step < 1 || step > totalSteps) return;
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'KeyN') {
        nextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyP') {
        prevStep();
      } else if (e.key >= '1' && e.key <= '6') {
        goToStep(parseInt(e.key, 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      transition: { duration: 0.2 },
    }),
  };

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (activityCategoryFilter === 'all') return true;
    if (activityCategoryFilter === 'physical') return act.category === 'physical';
    if (activityCategoryFilter === 'mental') return act.category === 'mental';
    return true;
  });

  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'instagram':
        return '📸';
      case 'tiktok':
        return '🎵';
      case 'youtube':
        return '▶️';
      case 'reddit':
        return '🤖';
      case 'twitter':
        return '🐦';
      default:
        return '📱';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24">
      {/* ========================================================= */}
      {/* 1. REWIND STORY STEPPER HEADER (Progress Bars & Tabs)     */}
      {/* ========================================================= */}
      <div className="apple-card p-4 rounded-3xl space-y-4 border border-white/[0.08]">
        {/* Story Progress Segment Bars (Instagram / Rewind App style) */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {CHAPTERS.map((chapter) => {
            const isCompleted = chapter.id < currentStep;
            const isCurrent = chapter.id === currentStep;
            return (
              <button
                key={chapter.id}
                onClick={() => goToStep(chapter.id)}
                className="group flex flex-col gap-1 text-left cursor-pointer focus:outline-none"
                title={`Jump to ${chapter.title}`}
              >
                <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-400 rounded-full ${
                      isCompleted
                        ? 'bg-[#30D158] w-full'
                        : isCurrent
                        ? 'bg-white w-full shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                        : 'w-0'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Chapter Header & Tab Navigation Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-bold text-sm shadow-md"
              style={{ backgroundColor: CHAPTERS[currentStep - 1].color }}
            >
              {currentStep}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#86868B]">
                  Chapter {currentStep} of {totalSteps}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70 border border-white/[0.08]">
                  Rewind Step
                </span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {CHAPTERS[currentStep - 1].title}
              </h1>
            </div>
          </div>

          {/* Quick Chapter Navigation Pills (Scrollable on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
            {CHAPTERS.map((chapter) => {
              const Icon = chapter.icon;
              const isActive = chapter.id === currentStep;
              return (
                <button
                  key={chapter.id}
                  onClick={() => goToStep(chapter.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-white text-black border-white shadow-md shadow-white/10 scale-[1.03]'
                      : 'bg-white/[0.03] text-[#86868B] border-white/[0.08] hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#86868B]'}`} />
                  <span className="hidden md:inline">{chapter.shortLabel}</span>
                  <span className="md:hidden">0{chapter.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. REWIND STEP VIEWPORT CONTAINER                         */}
      {/* ========================================================= */}
      <div className="relative min-h-[580px]">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ------------------------------------------------------------- */}
          {/* STEP 1: THE SCREEN TIME REWIND & AUDIT                        */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 1 && (
            <motion.div
              key="step-1-audit"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              {/* Rewind Hero Headline Card */}
              <div className="apple-card p-6 rounded-3xl border border-white/[0.1] relative overflow-hidden bg-gradient-to-br from-white/[0.05] via-transparent to-[#0A84FF]/10">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Clock className="w-64 h-64 text-[#0A84FF]" />
                </div>

                <div className="relative z-10 max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Daily Attention Audit & Rewind</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight font-display">
                    Where your time went today.
                  </h2>
                  <p className="text-sm text-[#86868B] leading-relaxed">
                    The average user loses 3.8 hours every day to reactive doomscrolling. With Motion Mint,
                    you convert that wasted dopamine loop into healthy physical motion and sharp mental focus.
                  </p>
                </div>
              </div>

              {/* Activity Rings & Screen Time Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Activity Rings Card */}
                <div className="apple-card p-6 rounded-3xl border border-white/[0.08] flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#86868B] font-mono">
                      Daily Activity Rings
                    </div>
                    <span className="text-[10px] font-mono text-[#30D158] bg-[#30D158]/10 px-2 py-0.5 rounded-full border border-[#30D158]/30">
                      Live Rings
                    </span>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Outer Ring: Minted (Emerald) */}
                        <circle cx="50" cy="50" r="40" stroke="#30D158" strokeWidth="7" fill="transparent" opacity="0.15" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#30D158"
                          strokeWidth="7"
                          fill="transparent"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * ring1Percent) / 100}
                          strokeLinecap="round"
                        />

                        {/* Middle Ring: Streak (Coral) */}
                        <circle cx="50" cy="50" r="30" stroke="#FF453A" strokeWidth="7" fill="transparent" opacity="0.15" />
                        <circle
                          cx="50"
                          cy="50"
                          r="30"
                          stroke="#FF453A"
                          strokeWidth="7"
                          fill="transparent"
                          strokeDasharray={188.4}
                          strokeDashoffset={188.4 - (188.4 * ring2Percent) / 100}
                          strokeLinecap="round"
                        />

                        {/* Inner Ring: XP / Level (Sapphire) */}
                        <circle cx="50" cy="50" r="20" stroke="#0A84FF" strokeWidth="7" fill="transparent" opacity="0.15" />
                        <circle
                          cx="50"
                          cy="50"
                          r="20"
                          stroke="#0A84FF"
                          strokeWidth="7"
                          fill="transparent"
                          strokeDasharray={125.6}
                          strokeDashoffset={125.6 - (125.6 * ring3Percent) / 100}
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-bold font-mono text-white">{availableMinutes}</span>
                        <span className="text-[9px] uppercase tracking-wider text-[#86868B] font-mono">Min Left</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06] text-xs">
                    <div className="flex items-center justify-between text-[#86868B]">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#30D158]" /> Minutes Goal</span>
                      <span className="font-mono text-white">{totalEarnedMinutes} / {dailyGoalMinutes}m</span>
                    </div>
                    <div className="flex items-center justify-between text-[#86868B]">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF453A]" /> 7-Day Streak</span>
                      <span className="font-mono text-white">{user.streak} / 7 days</span>
                    </div>
                    <div className="flex items-center justify-between text-[#86868B]">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0A84FF]" /> Level XP</span>
                      <span className="font-mono text-white">{user.xp % 200} / 200 XP</span>
                    </div>
                  </div>
                </div>

                {/* 2. Today's Screen Time Breakdown */}
                <div className="apple-card p-6 rounded-3xl border border-white/[0.08] flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#86868B] font-mono">
                      Targeted Addictive Apps
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">App Usage Interception</h3>
                  </div>

                  <div className="space-y-3">
                    {apps.slice(0, 4).map((app) => (
                      <div key={app.packageId} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white flex items-center gap-2">
                            <span className="text-sm">{getAppIcon(app.iconName)}</span>
                            <span>{app.name}</span>
                          </span>
                          <span className="font-mono text-[#FF453A] font-bold">{app.usedTodayMinutes}m spent</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FF453A] to-[#FF9F0A] rounded-full"
                            style={{ width: `${Math.min(100, (app.usedTodayMinutes / 60) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/20 text-xs text-[#FF453A] flex items-center justify-between">
                    <span className="font-semibold">Apps currently locked</span>
                    <span className="font-mono font-bold">{apps.filter((a) => a.isBlocked).length} guarded</span>
                  </div>
                </div>

                {/* 3. Screen Time Balance & Vault Status */}
                <div className="apple-card p-6 rounded-3xl border border-white/[0.08] flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#86868B] font-mono">
                      Minted Screen Time
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-5xl font-black text-white font-mono">{availableMinutes}</span>
                      <span className="text-lg font-semibold text-[#30D158]">minutes</span>
                    </div>
                    <p className="text-xs text-[#86868B] mt-1">Available to spend on guarded apps</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#86868B]">Lifetime Minted</span>
                      <span className="font-mono text-[#30D158] font-bold">+{totalEarnedMinutes}m</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#86868B]">Total Consumed</span>
                      <span className="font-mono text-[#FF453A] font-bold">-{totalSpentMinutes}m</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#86868B]">Streak Multiplier</span>
                      <span className="font-mono text-[#FF9F0A] font-bold">+10% Bonus</span>
                    </div>
                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full py-3 rounded-2xl bg-white hover:bg-[#E5E5EA] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-white/10 cursor-pointer transition-all active:scale-98"
                  >
                    <span>Configure App Locks (Chapter 2)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: GUARDIAN APP LOCKER                                   */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 2 && (
            <motion.div
              key="step-2-locker"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="apple-card p-6 rounded-3xl border border-white/[0.1] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30 text-xs font-semibold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Guardian App Interception</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight font-display">
                    Select the apps to guard.
                  </h2>
                  <p className="text-xs text-[#86868B]">
                    When locked, these apps cannot be opened without minting screen time through physical or mental focus.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenEmergency}
                    className="px-4 py-2 rounded-2xl bg-white/[0.04] hover:bg-[#FF453A]/20 border border-white/[0.08] hover:border-[#FF453A]/40 text-[#FF453A] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Emergency Bypass</span>
                  </button>
                </div>
              </div>

              {/* App Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {apps.map((app) => (
                  <div
                    key={app.packageId}
                    className={`apple-card p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                      app.isBlocked
                        ? 'border-[#FF453A]/30 bg-[#FF453A]/5 shadow-lg shadow-[#FF453A]/5'
                        : 'border-white/[0.08] bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/[0.1] flex items-center justify-center text-2xl shadow-inner">
                          {getAppIcon(app.iconName)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{app.name}</h3>
                          <span className="text-[10px] font-mono text-[#86868B]">{app.packageId}</span>
                        </div>
                      </div>

                      {/* Lock Toggle Switch */}
                      <button
                        onClick={() => onToggleAppBlock(app.packageId)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          app.isBlocked
                            ? 'bg-[#FF453A] text-white border-[#FF453A] shadow-md shadow-[#FF453A]/30'
                            : 'bg-white/[0.06] text-[#86868B] border-white/[0.1] hover:text-white'
                        }`}
                      >
                        {app.isBlocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Locked
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" /> Open
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[#86868B]">
                        <span>Today's Screen Time:</span>
                        <span className="font-mono text-white font-bold">{app.usedTodayMinutes}m</span>
                      </div>
                      <div className="flex items-center justify-between text-[#86868B]">
                        <span>Daily Allowance:</span>
                        <span className="font-mono text-[#30D158] font-bold">{app.dailyAllowanceMinutes}m limit</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onLaunchApp(app.packageId)}
                        className="flex-1 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                      >
                        <Play className="w-3.5 h-3.5 text-[#30D158]" />
                        <span>Test App Interception</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Action */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Chapter 1: Rewind Audit</span>
                </button>

                <button
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-full bg-[#30D158] hover:bg-[#30D158]/90 text-black text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#30D158]/20 active:scale-98"
                >
                  <span>Select Minting Quests (Chapter 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 3: MOTION & MIND MINTING HUB                             */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 3 && (
            <motion.div
              key="step-3-mint"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              {/* Header & Filter Controls */}
              <div className="apple-card p-6 rounded-3xl border border-white/[0.1] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Focus & Motion Minting Quests</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight font-display">
                    Pick an activity to mint screen time.
                  </h2>
                  <p className="text-xs text-[#86868B]">
                    Launch full-body computer vision reps, cognitive agility drills, or verified offline habits.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                  <button
                    onClick={() => setActivityCategoryFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activityCategoryFilter === 'all'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-[#86868B] hover:text-white'
                    }`}
                  >
                    All ({activities.length})
                  </button>
                  <button
                    onClick={() => setActivityCategoryFilter('physical')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activityCategoryFilter === 'physical'
                        ? 'bg-[#30D158] text-black shadow-sm'
                        : 'text-[#86868B] hover:text-white'
                    }`}
                  >
                    Physical ML
                  </button>
                  <button
                    onClick={() => setActivityCategoryFilter('mental')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activityCategoryFilter === 'mental'
                        ? 'bg-[#0A84FF] text-white shadow-sm'
                        : 'text-[#86868B] hover:text-white'
                    }`}
                  >
                    Cognitive Games
                  </button>
                </div>
              </div>

              {/* Activity Cards Grid with Playful Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActivities.map((act) => {
                  const meta = getActivityVisualMeta(act.id, act.icon, act.category);
                  return (
                    <div
                      key={act.id}
                      onClick={() => onSelectActivity(act.id)}
                      className="apple-card p-5 rounded-3xl border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.06] transition-all cursor-pointer group flex flex-col justify-between space-y-4 active:scale-98 shadow-xl relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <ActivityIcon
                            activityId={act.id}
                            iconName={act.icon}
                            category={act.category}
                            size="lg"
                            showBadge={true}
                            interactive={true}
                          />

                          <div>
                            <h3 className="font-bold text-white text-sm group-hover:text-[#30D158] transition-colors flex items-center gap-1.5">
                              <span>{act.title}</span>
                            </h3>
                            <p className="text-[11px] text-[#86868B] line-clamp-1 mt-0.5">
                              {act.description}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${
                            act.mlSupported
                              ? 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/30'
                              : 'bg-white/[0.04] text-[#86868B] border-white/[0.08]'
                          }`}
                        >
                          {act.mlSupported ? 'AI ML' : 'Sensor'}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
                        <div className="text-[11px] text-[#86868B] font-mono">
                          Target: <span className="text-white font-semibold">{act.defaultTarget} {act.targetUnit}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-[#30D158] bg-[#30D158]/15 px-3 py-1 rounded-full border border-[#30D158]/30 font-mono shadow-sm shadow-[#30D158]/10">
                            +{act.rewardMinutes}m (+{act.xpReward}XP)
                          </span>
                        </div>
                      </div>

                      <button className="w-full py-2.5 rounded-2xl bg-white/[0.06] group-hover:bg-[#30D158] group-hover:text-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch {act.title}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Chapter 2: App Locker</span>
                </button>

                <button
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-full bg-[#30D158] hover:bg-[#30D158]/90 text-black text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#30D158]/20 active:scale-98"
                >
                  <span>AI Proof & Verification (Chapter 4)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 4: AI PROOF & GEMINI REFEREE                             */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 4 && (
            <motion.div
              key="step-4-verification"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="apple-card p-6 rounded-3xl border border-white/[0.1] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BF5AF2]/15 text-[#BF5AF2] border border-[#BF5AF2]/30 text-xs font-semibold">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Gemini 3.7 Multimodal Vision Referee</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight font-display">
                    AI verification with zero manual cheating.
                  </h2>
                  <p className="text-xs text-[#86868B]">
                    Snap a photo of your book, water bottle, nature walk, or exercise mat to have Gemini AI verify authenticity and unlock minutes.
                  </p>
                </div>

                <button
                  onClick={onOpenAICameraProof}
                  className="px-5 py-3 rounded-full bg-[#BF5AF2] hover:bg-[#BF5AF2]/90 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#BF5AF2]/20 cursor-pointer transition-all active:scale-98"
                >
                  <Camera className="w-4 h-4" />
                  <span>Launch AI Camera Proof Viewfinder</span>
                </button>
              </div>

              {/* Supported AI Proof Habits Showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {AI_PROOF_HABITS.map((habit) => (
                  <div
                    key={habit.id}
                    onClick={onOpenAICameraProof}
                    className="apple-card p-5 rounded-3xl border border-white/[0.08] hover:border-[#BF5AF2]/40 hover:bg-white/[0.05] transition-all cursor-pointer group flex flex-col justify-between space-y-4 active:scale-98"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ActivityIcon
                          activityId={habit.id}
                          iconName={habit.icon}
                          category="habit"
                          size="lg"
                          showBadge={true}
                          interactive={true}
                        />
                        <div>
                          <h3 className="font-bold text-white text-sm group-hover:text-[#BF5AF2] transition-colors">
                            {habit.title}
                          </h3>
                          <span className="text-[10px] font-mono text-[#86868B]">{habit.unit}</span>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#30D158] font-mono bg-[#30D158]/10 px-2.5 py-0.5 rounded-full border border-[#30D158]/30">
                        +{habit.tokenReward}m
                      </span>
                    </div>

                    <p className="text-xs text-[#86868B] leading-relaxed line-clamp-2">
                      {habit.promptInstructions}
                    </p>

                    <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] text-[11px] text-[#86868B] flex items-center gap-1.5 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#30D158]" />
                      <span>Proof: {habit.exampleProof}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Anti-Cheating Telemetry Highlights */}
              <div className="apple-card p-6 rounded-3xl border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#30D158]" />
                    <span>Biomechanical Form Score</span>
                  </div>
                  <p className="text-xs text-[#86868B]">
                    Calculates joint angles, range-of-motion velocity, and posture alignment in 3D space.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#FF453A]" />
                    <span>Anti-Cheating Detection</span>
                  </div>
                  <p className="text-xs text-[#86868B]">
                    Disqualifies static photos, simulated phone movement, or non-human subjects automatically.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0A84FF]" />
                    <span>Instant Token Awarding</span>
                  </div>
                  <p className="text-xs text-[#86868B]">
                    Verified screen time minutes and streak XP deposit directly into your Screen Time Wallet.
                  </p>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Chapter 3: Mint Quests</span>
                </button>

                <button
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-full bg-[#30D158] hover:bg-[#30D158]/90 text-black text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#30D158]/20 active:scale-98"
                >
                  <span>Time Vault & Ledger (Chapter 5)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 5: TIME VAULT, STREAKS & TRANSACTION LEDGER              */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 5 && (
            <motion.div
              key="step-5-vault"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="apple-card p-6 rounded-3xl border border-white/[0.1] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30 text-xs font-semibold">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Screen Time Vault & Multipliers</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight font-display">
                    Your minted balance & audit ledger.
                  </h2>
                  <p className="text-xs text-[#86868B]">
                    Every minute earned through motion or spent on social media is cryptographically logged in your local ledger.
                  </p>
                </div>

                <button
                  onClick={onOpenLedger}
                  className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Ledger Modal</span>
                </button>
              </div>

              {/* Multiplier & Balance Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="apple-card p-6 rounded-3xl border border-white/[0.08] space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#86868B]">Active Balance</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white font-mono">{availableMinutes}</span>
                    <span className="text-base font-semibold text-[#30D158]">minutes</span>
                  </div>
                  <p className="text-xs text-[#86868B]">Ready to use in guarded apps</p>
                </div>

                <div className="apple-card p-6 rounded-3xl border border-white/[0.08] space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#FF9F0A]">Streak Multiplier</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#FF9F0A] font-mono">{user.streak}</span>
                    <span className="text-base font-semibold text-[#FF9F0A]">Days (+10%)</span>
                  </div>
                  <p className="text-xs text-[#86868B]">Bonus XP on all verified sessions</p>
                </div>

                <div className="apple-card p-6 rounded-3xl border border-white/[0.08] space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#0A84FF]">Total XP Progress</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#0A84FF] font-mono">{user.xp}</span>
                    <span className="text-base font-semibold text-white">XP (Lvl {user.level})</span>
                  </div>
                  <p className="text-xs text-[#86868B]">{200 - (user.xp % 200)} XP to Level {user.level + 1}</p>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="apple-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">Recent Ledger Activity</h3>
                  <span className="text-xs font-mono text-[#86868B]">{transactions.length} Total Transactions</span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {transactions.slice(0, 6).map((tx) => {
                    const isEarn = tx.type.startsWith('EARN') || tx.type === 'WELCOME_BONUS';
                    const isSpend = tx.type === 'SPEND_APP';
                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                              isEarn
                                ? 'bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30'
                                : isSpend
                                ? 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30'
                                : 'bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30'
                            }`}
                          >
                            {isEarn ? '+' : isSpend ? '-' : '!'}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {tx.activityName || tx.appName || tx.description}
                            </div>
                            <div className="text-[10px] text-[#86868B] font-mono">
                              {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-mono font-bold ${
                              isEarn
                                ? 'text-[#30D158]'
                                : isSpend
                                ? 'text-[#FF453A]'
                                : 'text-[#FF9F0A]'
                            }`}
                          >
                            {isEarn ? `+${Math.round(tx.amountSeconds / 60)}m` : `-${Math.round(tx.amountSeconds / 60)}m`}
                          </div>
                          <div className="text-[10px] text-[#86868B] font-mono">
                            {tx.verified ? '✓ Verified' : 'Standard'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Chapter 4: AI Proof</span>
                </button>

                <button
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-full bg-[#30D158] hover:bg-[#30D158]/90 text-black text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#30D158]/20 active:scale-98"
                >
                  <span>Phone Simulator (Chapter 6)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 6: PHONE SIMULATOR & ACTIVE SESSION                      */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 6 && (
            <motion.div
              key="step-6-simulator"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="apple-card p-6 rounded-3xl border border-white/[0.1] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#64D2FF]/15 text-[#64D2FF] border border-[#64D2FF]/30 text-xs font-semibold">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Interactive Smartphone Device Session</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight font-display">
                    Test the live phone interception experience.
                  </h2>
                  <p className="text-xs text-[#86868B]">
                    Try opening guarded apps to see how the system interceptor handles active screen time allowances and the floating Dynamic Island HUD.
                  </p>
                </div>

                <button
                  onClick={onOpenSimulator}
                  className="px-5 py-3 rounded-full bg-white hover:bg-[#E5E5EA] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-white/10 cursor-pointer transition-all active:scale-98"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Launch Full Screen Phone Simulator</span>
                </button>
              </div>

              {/* Embedded Phone Mockup & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left Controls & Instructions */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="apple-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#30D158]" />
                      <span>Android OS System Services</span>
                    </h3>

                    <div className="space-y-3 text-xs text-[#86868B]">
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                        <div className="p-1.5 rounded-xl bg-[#30D158]/10 text-[#30D158] font-bold font-mono">01</div>
                        <div>
                          <div className="font-semibold text-white">UsageStatsManager Polling</div>
                          <p>Detects foreground package launches in under 120ms with low battery overhead.</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                        <div className="p-1.5 rounded-xl bg-[#0A84FF]/10 text-[#0A84FF] font-bold font-mono">02</div>
                        <div>
                          <div className="font-semibold text-white">SYSTEM_ALERT_WINDOW Overlay</div>
                          <p>Intercepts guarded apps with a non-dismissible focus barrier if minutes are 0.</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                        <div className="p-1.5 rounded-xl bg-[#FF9F0A]/10 text-[#FF9F0A] font-bold font-mono">03</div>
                        <div>
                          <div className="font-semibold text-white">Dynamic Floating PiP HUD</div>
                          <p>Displays remaining minutes and live session burn rate directly above the active app.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => onSelectActivity('pushups')}
                        className="w-full py-3 rounded-2xl bg-[#30D158] hover:bg-[#30D158]/90 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#30D158]/20 cursor-pointer transition-all active:scale-98"
                      >
                        <Dumbbell className="w-4 h-4" />
                        <span>Earn More Minutes (Pushups)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Phone Preview Frame */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="w-[300px] h-[580px] bg-black rounded-[48px] p-3.5 border-4 border-[#2C2C2E] shadow-2xl relative flex flex-col justify-between overflow-hidden">
                    {/* Dynamic Island Notch */}
                    <div className="mx-auto w-24 h-5 bg-black rounded-full border border-white/[0.1] z-20 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
                      <span className="text-[9px] font-mono text-white font-bold">{availableMinutes}m Left</span>
                    </div>

                    {/* Phone Screen Body */}
                    <div className="flex-1 rounded-[36px] bg-[#0E0E12] border border-white/[0.08] p-4 flex flex-col justify-between mt-2 overflow-hidden relative">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between text-[10px] text-[#86868B] font-mono pt-1">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          <BrandLogo size="xs" showText={false} showBadge={false} />
                          <span className="text-[#30D158] font-bold">Guardian</span>
                        </div>
                      </div>

                      {/* Phone App Grid */}
                      <div className="grid grid-cols-3 gap-3 py-4">
                        {apps.map((app) => (
                          <button
                            key={app.packageId}
                            onClick={() => onLaunchApp(app.packageId)}
                            className="flex flex-col items-center gap-1 group cursor-pointer"
                          >
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md transition-all group-hover:scale-110 relative ${
                                app.isBlocked
                                  ? 'bg-[#FF453A]/20 border border-[#FF453A]/40'
                                  : 'bg-white/[0.08] border border-white/[0.1]'
                              }`}
                            >
                              {getAppIcon(app.iconName)}
                              {app.isBlocked && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF453A] flex items-center justify-center text-[9px] text-white">
                                  <Lock className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-white/80 font-medium truncate w-16 text-center">
                              {app.name}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Bottom Floating Dynamic HUD Widget */}
                      <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-md flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#30D158] animate-ping" />
                          <span className="text-[10px] text-white font-semibold">Focus Guardian</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#30D158] font-bold">
                          {availableMinutes} min unlocked
                        </span>
                      </div>
                    </div>

                    {/* Home Indicator Bar */}
                    <div className="mx-auto w-28 h-1 bg-white/40 rounded-full mt-2" />
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Chapter 5: Time Vault</span>
                </button>

                <button
                  onClick={() => goToStep(1)}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E5E5EA] text-black text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-white/10 active:scale-98"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Rewind Journey</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
