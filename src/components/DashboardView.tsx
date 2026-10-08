import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Brain,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Dumbbell,
  Eye,
  Flame,
  Footprints,
  Gift,
  Grid,
  Heart,
  History,
  Instagram,
  Layers,
  Lock,
  MessageCircle,
  Play,
  Plus,
  Radio,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Smile,
  Sparkles,
  Timer,
  TrendingUp,
  Trophy,
  Unlock,
  Video,
  Wallet,
  Wind,
  Youtube,
  Zap,
} from 'lucide-react';
import { ActivityIcon, getActivityVisualMeta } from './ActivityIcon';
import { BrandLogo } from './BrandLogo';
import {
  Achievement,
  ActivityDefinition,
  BlockedApp,
  Challenge,
  ExerciseType,
  ScreenTimeWallet,
  UserProfile,
} from '../types';

interface DashboardViewProps {
  user: UserProfile;
  wallet: ScreenTimeWallet;
  apps: BlockedApp[];
  activities: ActivityDefinition[];
  challenges: Challenge[];
  achievements: Achievement[];
  onSelectActivity: (type: ExerciseType) => void;
  onLaunchApp: (packageId: string) => void;
  onToggleAppBlock: (packageId: string) => void;
  onOpenLedger: () => void;
  onOpenChallenges: () => void;
  onOpenSimulator: () => void;
  onOpenEmergency: () => void;
  onOpenAICameraProof?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  wallet,
  apps,
  activities,
  challenges,
  achievements,
  onSelectActivity,
  onLaunchApp,
  onToggleAppBlock,
  onOpenLedger,
  onOpenChallenges,
  onOpenSimulator,
  onOpenEmergency,
  onOpenAICameraProof,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'physical' | 'mental'>('all');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appFilter, setAppFilter] = useState<'all' | 'locked' | 'unlocked'>('all');

  const availableMinutes = Math.floor(wallet.balanceSeconds / 60);
  const earnedTodayMinutes = Math.floor(wallet.dailyEarnedSeconds / 60);
  const usedTodayMinutes = Math.floor(wallet.dailyUsedSeconds / 60);
  const dailyAllowanceMins = Math.floor(wallet.dailyAllowanceAvailableSeconds / 60);
  const netSurplusMinutes = earnedTodayMinutes - usedTodayMinutes;

  const currentLevelXP = user.xp % 200;
  const xpPercent = Math.min(100, Math.round((currentLevelXP / 200) * 100));

  // Today's main daily challenge
  const mainChallenge = challenges.find((c) => c.type === 'daily' && !c.isClaimed) || challenges[0];
  const challengePercent = mainChallenge
    ? Math.min(100, Math.round((mainChallenge.currentValue / mainChallenge.targetValue) * 100))
    : 0;

  // Filter activities
  const filteredActivities = activities.filter((act) =>
    activeCategory === 'all' ? true : act.category === activeCategory
  );

  // Filter apps
  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      app.packageId.toLowerCase().includes(appSearchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (appFilter === 'locked') return app.isBlocked && !app.isCurrentlyUnlocked;
    if (appFilter === 'unlocked') return app.isCurrentlyUnlocked && app.availableSeconds > 0;
    return true;
  });

  const lockedCount = apps.filter((a) => a.isBlocked).length;
  const unlockedActiveCount = apps.filter(
    (a) => a.isCurrentlyUnlocked && a.availableSeconds > 0
  ).length;

  // Weekly trends telemetry data
  const weeklyData = [
    { day: 'Mon', earned: 35, used: 20 },
    { day: 'Tue', earned: 45, used: 25 },
    { day: 'Wed', earned: 30, used: 30 },
    { day: 'Thu', earned: 50, used: 15 },
    { day: 'Fri', earned: 40, used: 20 },
    { day: 'Sat', earned: 60, used: 35 },
    { day: 'Sun', earned: earnedTodayMinutes || 35, used: usedTodayMinutes || 15 },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-16">
      {/* 1. APPLE CONTROL CENTER TOP STATUS & ACTIONS STRIP */}
      <div className="apple-card rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Live System State Pill */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#30D158]"></span>
            </span>
            <span className="text-[#30D158] font-semibold">Active Shield</span>
            <span className="text-white/20">|</span>
            <span className="text-[#86868B] hidden sm:inline font-normal">Accessibility Service Guard</span>
            <span className="text-[#86868B] sm:hidden font-normal">Guarded</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#86868B] font-mono px-1">
            <span className="text-white font-semibold">{lockedCount}</span> Locked
            <span className="text-white/20">/</span>
            <span className="text-[#30D158] font-semibold">{unlockedActiveCount}</span> Active
          </div>
        </div>

        {/* Refined Action Pill Group */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onOpenAICameraProof && (
            <button
              id="cmd-ai-proof-btn"
              onClick={onOpenAICameraProof}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#30D158]/15 hover:bg-[#30D158]/25 border border-[#30D158]/40 text-[#30D158] hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-[#30D158]/10 active:scale-[0.97]"
              title="Snap AI Camera Proof for physical exercises, books, journals & offline habits"
            >
              <Camera className="w-3.5 h-3.5 text-[#30D158]" />
              <span>AI Camera</span>
            </button>
          )}

          <button
            id="cmd-phone-simulator-btn"
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#F5F5F7] text-xs font-medium transition-all cursor-pointer active:scale-[0.97]"
            title="Open Phone Device Simulator"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#0A84FF]" />
            <span>Simulator</span>
          </button>

          <button
            id="cmd-audit-ledger-btn"
            onClick={onOpenLedger}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#F5F5F7] text-xs font-medium transition-all cursor-pointer active:scale-[0.97]"
            title="Audit Screen Time Ledger"
          >
            <History className="w-3.5 h-3.5 text-[#30D158]" />
            <span>Ledger</span>
          </button>

          <button
            id="cmd-challenges-btn"
            onClick={onOpenChallenges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#F5F5F7] text-xs font-medium transition-all cursor-pointer active:scale-[0.97]"
            title="View Quests & Achievements"
          >
            <Trophy className="w-3.5 h-3.5 text-[#FF9F0A]" />
            <span>Quests ({challenges.filter((c) => !c.isClaimed).length})</span>
          </button>

          <button
            id="cmd-emergency-bypass-btn"
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF453A]/10 hover:bg-[#FF453A]/20 border border-[#FF453A]/30 text-[#FF453A] text-xs font-medium transition-all cursor-pointer active:scale-[0.97]"
            title="Request Emergency Bypass"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SOS Bypass</span>
          </button>
        </div>
      </div>

      {/* 2. APPLE FITNESS+ STYLE TELEMETRY HERO (12-COL GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* Main Screen Time Wallet Card (5 cols) */}
        <div className="md:col-span-5 apple-card rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#30D158]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BrandLogo size="xs" showText={false} showBadge={false} />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
                  Screen Time Balance
                </div>
                <div className="text-xs font-semibold text-white">Motion Mint Wallet</div>
              </div>
            </div>

            <span
              className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${
                availableMinutes > 15
                  ? 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/30'
                  : availableMinutes > 0
                  ? 'bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/30'
                  : 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/30'
              }`}
            >
              {availableMinutes > 15 ? 'OPTIMAL' : availableMinutes > 0 ? 'LOW' : 'DEPLETED'}
            </span>
          </div>

          {/* Main Balance Display */}
          <div className="flex items-baseline justify-between gap-2 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-black font-display text-white tracking-tighter">
                {availableMinutes}
              </span>
              <span className="text-sm font-semibold text-[#30D158]">
                min available
              </span>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-[#86868B]">Net Today</div>
              <div
                className={`text-xs font-mono font-bold ${
                  netSurplusMinutes >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'
                }`}
              >
                {netSurplusMinutes >= 0 ? `+${netSurplusMinutes}m` : `${netSurplusMinutes}m`}
              </div>
            </div>
          </div>

          {/* Apple HIG Metrics Sub-Row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] font-medium text-[#86868B]">Earned</div>
              <div className="text-sm font-bold font-display text-[#30D158] font-mono mt-0.5">
                +{earnedTodayMinutes}m
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] font-medium text-[#86868B]">Used</div>
              <div className="text-sm font-bold font-display text-[#F5F5F7] font-mono mt-0.5">
                {usedTodayMinutes}m
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] font-medium text-[#86868B]">Allowance</div>
              <div className="text-sm font-bold font-display text-[#0A84FF] font-mono mt-0.5">
                {dailyAllowanceMins}m
              </div>
            </div>
          </div>
        </div>

        {/* Discipline Rank & Daily Quest HUD (4 cols) */}
        <div className="md:col-span-4 apple-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4">
          {/* Level Header & Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF]">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase text-[#86868B]">Discipline Tier</div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  Level {user.level} Warrior
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-[#FF9F0A]/10 border border-[#FF9F0A]/25 px-2.5 py-1 rounded-full text-[#FF9F0A] text-xs font-semibold font-mono">
              <Flame className="w-3.5 h-3.5 text-[#FF9F0A]" />
              <span>{user.streak}d Streak</span>
            </div>
          </div>

          {/* Compact XP Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium">
              <span className="text-[#86868B]">XP to Level {user.level + 1}</span>
              <span className="text-[#0A84FF] font-mono font-semibold">
                {currentLevelXP}/200 XP
              </span>
            </div>
            <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden p-[1px]">
              <div
                className="bg-gradient-to-r from-[#0A84FF] to-[#30D158] h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Today's Active Daily Quest */}
          {mainChallenge && (
            <div
              onClick={onOpenChallenges}
              className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#30D158]/30 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="text-[9px] uppercase font-bold text-[#FF9F0A] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Daily Quest
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {mainChallenge.title}
                </div>
                <div className="text-[10px] text-[#86868B] font-mono">
                  {mainChallenge.currentValue}/{mainChallenge.targetValue} {mainChallenge.unit} • +
                  {mainChallenge.rewardMinutes}m
                </div>
              </div>

              {/* Apple Activity Circular Ring */}
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/[0.08]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#30D158] transition-all duration-500"
                    strokeDasharray={`${challengePercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono text-[9px] font-bold text-white">
                  {challengePercent}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 7-Day Activity Trends Telemetry (3 cols) */}
        <div className="md:col-span-3 apple-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-semibold text-[#86868B] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#30D158]" />
              <span>7-Day Telemetry</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono">
              <span className="text-[#30D158]">● Earn</span>
              <span className="text-[#86868B]">● Use</span>
            </div>
          </div>

          {/* Apple Health Activity Bars */}
          <div className="h-20 flex items-end justify-between gap-2 pt-2">
            {weeklyData.map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
              >
                <div className="w-full max-w-[16px] flex items-end gap-[2px] h-14">
                  {/* Earned Bar */}
                  <div
                    className="flex-1 bg-gradient-to-t from-[#0A84FF] to-[#30D158] rounded-t-full transition-all duration-300"
                    style={{ height: `${Math.max(12, Math.min(100, (d.earned / 60) * 100))}%` }}
                    title={`${d.day}: +${d.earned}m earned`}
                  />
                  {/* Used Bar */}
                  <div
                    className="flex-1 bg-white/[0.12] hover:bg-white/[0.2] rounded-t-full transition-all duration-300"
                    style={{ height: `${Math.max(12, Math.min(100, (d.used / 60) * 100))}%` }}
                    title={`${d.day}: ${d.used}m used`}
                  />
                </div>
                <span className="text-[10px] font-mono text-[#86868B]">{d.day[0]}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#86868B] pt-1.5 border-t border-white/[0.06] font-mono">
            <span>Discipline Ratio</span>
            <span className="text-[#30D158] font-bold">
              {usedTodayMinutes > 0
                ? `${((earnedTodayMinutes / (usedTodayMinutes || 1)) * 100).toFixed(0)}%`
                : '100%'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT (2 COLUMNS: SHIELDED APPS 5 COLS + QUICK EARN ACTIVITIES 7 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* LEFT: APPLE HIG CONTROLLED APPS (5 COLS) */}
        <div className="lg:col-span-5 apple-card rounded-3xl p-4 sm:p-5 space-y-3.5">
          {/* Header with Search & iOS Segmented Picker */}
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FF453A]" />
              <h2 className="text-sm font-bold text-white tracking-tight">
                Shielded Apps ({apps.length})
              </h2>
            </div>

            {/* iOS Segmented Switcher */}
            <div className="flex gap-0.5 p-0.5 bg-white/[0.06] border border-white/[0.08] rounded-full text-[11px]">
              <button
                onClick={() => setAppFilter('all')}
                className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
                  appFilter === 'all'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAppFilter('locked')}
                className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
                  appFilter === 'locked'
                    ? 'bg-[#FF453A] text-white font-semibold shadow-sm'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                Locked
              </button>
              <button
                onClick={() => setAppFilter('unlocked')}
                className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
                  appFilter === 'unlocked'
                    ? 'bg-[#30D158] text-black font-semibold shadow-sm'
                    : 'text-[#86868B] hover:text-white'
                }`}
              >
                Active
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search apps by name..."
              value={appSearchQuery}
              onChange={(e) => setAppSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#86868B] focus:outline-none focus:border-[#30D158]/50 transition-all font-sans"
            />
          </div>

          {/* App Items List */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-0.5">
            {filteredApps.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#86868B]">
                No matching applications found.
              </div>
            ) : (
              filteredApps.map((app) => {
                const isUnlocked = app.isCurrentlyUnlocked && app.availableSeconds > 0;
                const remainingMins = Math.ceil(app.availableSeconds / 60);
                const usagePercent = Math.min(
                  100,
                  Math.round((app.usedTodayMinutes / (app.dailyAllowanceMinutes || 30)) * 100)
                );

                return (
                  <div
                    key={app.packageId}
                    className={`p-3 rounded-2xl border transition-all ${
                      isUnlocked
                        ? 'bg-[#30D158]/5 border-[#30D158]/30'
                        : app.isBlocked
                        ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                        : 'bg-white/[0.01] border-white/[0.04] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      {/* App Icon + Information */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                            app.packageId.includes('instagram')
                              ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white'
                              : app.packageId.includes('youtube')
                              ? 'bg-red-600 text-white'
                              : app.packageId.includes('musically')
                              ? 'bg-black border border-white/20 text-[#64D2FF]'
                              : 'bg-neutral-800 text-white'
                          }`}
                        >
                          {app.packageId.includes('instagram') && (
                            <Instagram className="w-4.5 h-4.5" />
                          )}
                          {app.packageId.includes('youtube') && <Youtube className="w-4.5 h-4.5" />}
                          {app.packageId.includes('musically') && <Video className="w-4.5 h-4.5" />}
                          {!app.packageId.includes('instagram') &&
                            !app.packageId.includes('youtube') &&
                            !app.packageId.includes('musically') && <Lock className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white truncate">
                              {app.name}
                            </span>
                            {isUnlocked ? (
                              <span className="text-[10px] text-[#30D158] font-semibold bg-[#30D158]/10 px-2 py-0.5 rounded-full border border-[#30D158]/30 shrink-0">
                                {remainingMins}m Left
                              </span>
                            ) : app.isBlocked ? (
                              <span className="text-[10px] text-[#FF453A] font-semibold bg-[#FF453A]/10 px-2 py-0.5 rounded-full border border-[#FF453A]/30 shrink-0">
                                Locked
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#86868B] shrink-0">Free</span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#86868B] font-mono truncate mt-0.5">
                            Used {app.usedTodayMinutes}m / {app.dailyAllowanceMinutes}m limit
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Toggle Lock & Test Launch */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onToggleAppBlock(app.packageId)}
                          className={`p-2 rounded-full transition-all cursor-pointer active:scale-[0.95] ${
                            app.isBlocked
                              ? 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30 hover:bg-[#FF453A]/25'
                              : 'bg-white/[0.04] text-[#86868B] hover:bg-white/[0.08]'
                          }`}
                          title={app.isBlocked ? 'App is Blocked by Shield' : 'App is Unlocked'}
                        >
                          {app.isBlocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => onLaunchApp(app.packageId)}
                          className="px-2.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold border border-white/[0.1] transition-all flex items-center gap-1 cursor-pointer active:scale-[0.95]"
                          title="Test Launch & Interception"
                        >
                          <Play className="w-3 h-3 fill-current text-[#30D158]" />
                          <span>Launch</span>
                        </button>
                      </div>
                    </div>

                    {/* Micro Usage Progress Bar */}
                    <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden mt-2.5">
                      <div
                        className={`h-full rounded-full ${
                          usagePercent > 80 ? 'bg-[#FF453A]' : 'bg-[#0A84FF]'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: APPLE FITNESS+ QUICK EARN ENGINE (7 COLS) */}
        <div className="lg:col-span-7 apple-card rounded-3xl p-4 sm:p-5 space-y-3.5">
          {/* Header + Category Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#30D158]" />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Quick Earn Engine ({filteredActivities.length} Activities)
                </h2>
              </div>
              <p className="text-[11px] text-[#86868B] mt-0.5">
                Perform verified exercises to mint screen time tokens straight into your wallet.
              </p>
            </div>

            {/* Apple Segmented Category Switcher */}
            <div className="flex gap-0.5 p-0.5 bg-white/[0.06] border border-white/[0.08] rounded-full self-start sm:self-auto text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'physical', label: '🏋️ Physical' },
                { id: 'mental', label: '🧠 Mental' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-[#86868B] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gemini AI Guardian Protocol Notice */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#30D158]/10 via-[#0A84FF]/10 to-transparent border border-[#30D158]/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#30D158]/20 text-[#30D158] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Gemini 3.7 Vision Task Guardian</span>
                  <span className="text-[9px] font-mono uppercase bg-[#30D158]/20 text-[#30D158] px-2 py-0.5 rounded-full border border-[#30D158]/30">Anti-Cheat Active</span>
                </div>
                <div className="text-[11px] text-[#86868B] mt-0.5">
                  Camera vision audits repetitions, form &amp; real-world habit proofs before token minting.
                </div>
              </div>
            </div>
            {onOpenAICameraProof && (
              <button
                onClick={onOpenAICameraProof}
                className="px-3.5 py-1.5 rounded-full bg-[#30D158] hover:bg-[#28b84c] text-black text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#30D158]/20 active:scale-[0.96]"
              >
                <Camera className="w-3.5 h-3.5" /> Snap Proof
              </button>
            )}
          </div>

          {/* Activity Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-0.5">
            {filteredActivities.map((act) => {
              const meta = getActivityVisualMeta(act.id, act.icon, act.category);
              return (
                <div
                  key={act.id}
                  onClick={() => onSelectActivity(act.id)}
                  className="bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.18] hover:bg-white/[0.06] rounded-2xl p-3.5 text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3 active:scale-[0.98] relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <ActivityIcon
                        activityId={act.id}
                        iconName={act.icon}
                        category={act.category}
                        size="md"
                        showBadge={true}
                        interactive={true}
                      />

                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-xs group-hover:text-[#30D158] transition-colors flex items-center gap-1.5 truncate">
                          <span>{act.title}</span>
                        </h3>
                        <p className="text-[11px] text-[#86868B] line-clamp-1 mt-0.5">
                          {act.description}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                        act.mlSupported
                          ? 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/30'
                          : 'bg-white/[0.04] text-[#86868B] border-white/[0.08]'
                      }`}
                    >
                      {act.mlSupported ? 'AI ML' : 'Sensor'}
                    </span>
                  </div>

                  {/* Sub-row: Target & Reward */}
                  <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="text-[11px] text-[#86868B] font-mono flex items-center gap-1">
                      <span>Target:</span>
                      <span className="text-white font-semibold">
                        {act.defaultTarget} {act.targetUnit}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-[#30D158] bg-[#30D158]/10 px-2.5 py-1 rounded-full border border-[#30D158]/30 shadow-sm shadow-[#30D158]/10">
                        +{act.rewardMinutes}m (+{act.xpReward}XP)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

