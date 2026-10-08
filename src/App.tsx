/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AndroidSimulatorModal } from './components/AndroidSimulatorModal';
import { AppBlockerView } from './components/AppBlockerView';
import { ArchitectureModal } from './components/ArchitectureModal';
import { ChallengesModal } from './components/ChallengesModal';
import { DashboardView } from './components/DashboardView';
import { EmergencyBypassModal } from './components/EmergencyBypassModal';
import { FloatingTimerOverlay } from './components/FloatingTimerOverlay';
import { MentalExerciseView } from './components/MentalExerciseView';
import { Navbar } from './components/Navbar';
import { OnboardingModal } from './components/OnboardingModal';
import { PhysicalExerciseView } from './components/PhysicalExerciseView';
import { WalletLedgerModal } from './components/WalletLedgerModal';
import { AICameraProofModal } from './components/AICameraProofModal';
import { RewindStepFlow } from './components/RewindStepFlow';
import { appBlockerService } from './services/appBlockerService';
import { INITIAL_ACTIVITIES, repository } from './services/storageRepository';
import {
  Achievement,
  ActivityDefinition,
  BlockedApp,
  Challenge,
  ExerciseType,
  RewardCalculationResult,
  ScreenTimeTransaction,
  ScreenTimeWallet,
  UserProfile,
} from './types';

export default function App() {
  const [user, setUser] = useState<UserProfile>(repository.getUser());
  const [wallet, setWallet] = useState<ScreenTimeWallet>(repository.getWallet());
  const [apps, setApps] = useState<BlockedApp[]>(repository.getApps());
  const [transactions, setTransactions] = useState<ScreenTimeTransaction[]>(repository.getTransactions());
  const [challenges, setChallenges] = useState<Challenge[]>(repository.getChallenges());
  const [achievements, setAchievements] = useState<Achievement[]>(repository.getAchievements());

  const [viewMode, setViewMode] = useState<'rewind' | 'dashboard'>('rewind');

  // Modal / View States
  const [activeExercise, setActiveExercise] = useState<ExerciseType | null>(null);
  const [isPhysicalViewOpen, setIsPhysicalViewOpen] = useState(false);
  const [isMentalViewOpen, setIsMentalViewOpen] = useState(false);

  const [isBlockerOverlayOpen, setIsBlockerOverlayOpen] = useState(false);
  const [targetBlockedApp, setTargetBlockedApp] = useState<BlockedApp | null>(null);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAICameraProofOpen, setIsAICameraProofOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!repository.getUser().onboardingCompleted);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = repository.subscribe(() => {
      setUser(repository.getUser());
      setWallet(repository.getWallet());
      setApps(repository.getApps());
      setTransactions(repository.getTransactions());
      setChallenges(repository.getChallenges());
      setAchievements(repository.getAchievements());
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to AppBlocker Service overlay events
  useEffect(() => {
    const unsubscribe = appBlockerService.subscribe((activeApp, isBlocked) => {
      if (isBlocked && activeApp) {
        setTargetBlockedApp(activeApp);
        setIsBlockerOverlayOpen(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Launch App Attempt
  const handleLaunchApp = (packageId: string) => {
    const result = appBlockerService.attemptLaunchApp(packageId);
    if (!result.allowed) {
      setTargetBlockedApp(result.app);
      setIsBlockerOverlayOpen(true);
    } else {
      // Launch directly in phone simulator
      setIsSimulatorOpen(true);
    }
  };

  const handleToggleAppBlock = (packageId: string) => {
    repository.toggleAppBlock(packageId);
  };

  const handleSelectActivity = (exerciseType: ExerciseType) => {
    const actDef = INITIAL_ACTIVITIES.find((a) => a.id === exerciseType);
    setActiveExercise(exerciseType);

    if (actDef?.category === 'physical') {
      setIsPhysicalViewOpen(true);
      setIsMentalViewOpen(false);
    } else {
      setIsMentalViewOpen(true);
      setIsPhysicalViewOpen(false);
    }
  };

  const handleRewardClaimed = (_result: RewardCalculationResult) => {
    setIsPhysicalViewOpen(false);
    setIsMentalViewOpen(false);
    setActiveExercise(null);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data and restart onboarding?')) {
      repository.resetAllData();
      setIsOnboardingOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Sticky Navigation Bar */}
      <Navbar
        user={user}
        wallet={wallet}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenLedger={() => setIsLedgerOpen(true)}
        onOpenChallenges={() => setIsChallengesOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenAICameraProof={() => setIsAICameraProofOpen(true)}
        onResetData={handleResetData}
      />

      {/* Layout View Mode Switcher Header Bar */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs">
          <button
            id="view-mode-rewind-btn"
            onClick={() => setViewMode('rewind')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'rewind'
                ? 'bg-white text-black shadow-md shadow-white/10'
                : 'text-[#86868B] hover:text-white'
            }`}
          >
            <span>Rewind Step Flow</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#30D158]/20 text-[#30D158] font-bold">
              6 Steps
            </span>
          </button>

          <button
            id="view-mode-dashboard-btn"
            onClick={() => setViewMode('dashboard')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'dashboard'
                ? 'bg-white text-black shadow-md shadow-white/10'
                : 'text-[#86868B] hover:text-white'
            }`}
          >
            <span>Overview Dashboard</span>
          </button>
        </div>

        <div className="text-[11px] text-[#86868B] font-mono hidden sm:flex items-center gap-1.5">
          <span>Tip: Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white border border-white/[0.1] text-[10px]">
            ←
          </kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white border border-white/[0.1] text-[10px]">
            →
          </kbd>
          <span>to navigate Rewind chapters</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {viewMode === 'rewind' ? (
          <RewindStepFlow
            user={user}
            wallet={wallet}
            apps={apps}
            activities={INITIAL_ACTIVITIES}
            challenges={challenges}
            achievements={achievements}
            transactions={transactions}
            onSelectActivity={handleSelectActivity}
            onLaunchApp={handleLaunchApp}
            onToggleAppBlock={handleToggleAppBlock}
            onOpenLedger={() => setIsLedgerOpen(true)}
            onOpenChallenges={() => setIsChallengesOpen(true)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenAICameraProof={() => setIsAICameraProofOpen(true)}
          />
        ) : (
          <DashboardView
            user={user}
            wallet={wallet}
            apps={apps}
            activities={INITIAL_ACTIVITIES}
            challenges={challenges}
            achievements={achievements}
            onSelectActivity={handleSelectActivity}
            onLaunchApp={handleLaunchApp}
            onToggleAppBlock={handleToggleAppBlock}
            onOpenLedger={() => setIsLedgerOpen(true)}
            onOpenChallenges={() => setIsChallengesOpen(true)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenAICameraProof={() => setIsAICameraProofOpen(true)}
          />
        )}
      </main>

      {/* Physical Activity Camera View */}
      {isPhysicalViewOpen && activeExercise && (
        <PhysicalExerciseView
          exerciseType={activeExercise}
          onClose={() => {
            setIsPhysicalViewOpen(false);
            setActiveExercise(null);
          }}
          onRewardClaimed={handleRewardClaimed}
        />
      )}

      {/* Mental Focus Activity View */}
      {isMentalViewOpen && activeExercise && (
        <MentalExerciseView
          exerciseType={activeExercise}
          onClose={() => {
            setIsMentalViewOpen(false);
            setActiveExercise(null);
          }}
          onRewardClaimed={handleRewardClaimed}
        />
      )}

      {/* App Blocker Interception Overlay */}
      {isBlockerOverlayOpen && targetBlockedApp && (
        <AppBlockerView
          app={targetBlockedApp}
          onClose={() => {
            setIsBlockerOverlayOpen(false);
            appBlockerService.closeBlockerOverlay();
          }}
          onEarnScreenTime={() => {
            setIsBlockerOverlayOpen(false);
            handleSelectActivity('pushups');
          }}
          onOpenEmergencyBypass={() => {
            setIsBlockerOverlayOpen(false);
            setIsEmergencyOpen(true);
          }}
        />
      )}

      {/* Interactive Android Phone Device Simulator */}
      <AndroidSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSelectExercise={() => {
          setIsSimulatorOpen(false);
          handleSelectActivity('pushups');
        }}
        onOpenEmergency={() => {
          setIsSimulatorOpen(false);
          setIsEmergencyOpen(true);
        }}
        onOpenAICameraProof={() => {
          setIsSimulatorOpen(false);
          setIsAICameraProofOpen(true);
        }}
      />

      {/* Wallet Transaction Ledger & Allowance Settings */}
      <WalletLedgerModal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        wallet={wallet}
        transactions={transactions}
        apps={apps}
      />

      {/* Challenges & Achievements Gallery */}
      <ChallengesModal
        isOpen={isChallengesOpen}
        onClose={() => setIsChallengesOpen(false)}
        user={user}
        challenges={challenges}
        achievements={achievements}
      />

      {/* Emergency Bypass Modal */}
      <EmergencyBypassModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        apps={apps}
      />

      {/* Android Clean Architecture & ML Integration Spec */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Floating Picture-in-Picture Timer Overlay */}
      <FloatingTimerOverlay />

      {/* Onboarding Flow (First Run) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />

      {/* Standalone AI Camera Proof Modal for Quick Earn and Habit Photo Verification */}
      <AICameraProofModal
        isOpen={isAICameraProofOpen}
        onClose={() => setIsAICameraProofOpen(false)}
        onRewardClaimed={handleRewardClaimed}
      />
    </div>
  );
}
