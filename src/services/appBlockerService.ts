import { soundService } from './audioService';
import { repository } from './storageRepository';
import { BlockedApp } from '../types';

export interface AppLaunchAttemptResult {
  allowed: boolean;
  reason: 'HAS_AVAILABLE_TIME' | 'WALLET_TIME_USED' | 'LOCKED_NO_TIME' | 'NOT_BLOCKED';
  remainingSeconds: number;
  app: BlockedApp;
  message: string;
  dynamicCostMultiplier?: number;
}

export type BlockerStateListener = (
  activeApp: BlockedApp | null,
  isBlockedOverlayVisible: boolean
) => void;

/**
 * Android-like Package App Monitoring & Blocker Engine
 * Simulates AccessibilityService + UsageStatsManager + SYSTEM_ALERT_WINDOW overlays
 * Features:
 * - Dynamic Hour/Doomscroll Rate Multiplier (2x-3x at night or for doomscroll reels)
 * - In-Session Intermittent Micro-Break "Toll Gates" (forces re-verification)
 * - Native Picture-in-Picture Floating Counter
 */
export class AppBlockerService {
  private activeApp: BlockedApp | null = null;
  private isBlockedOverlayVisible: boolean = false;
  private listeners: Set<BlockerStateListener> = new Set();
  private timerInterval: number | null = null;

  constructor() {
    this.startGlobalWatchdog();
  }

  subscribe(listener: BlockerStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.activeApp, this.isBlockedOverlayVisible));
  }

  getActiveApp(): BlockedApp | null {
    return this.activeApp;
  }

  isOverlayOpen(): boolean {
    return this.isBlockedOverlayVisible;
  }

  /**
   * Calculate Dynamic Exchange Multiplier (e.g. 10 PM - 6 AM is 2.0x, High Risk Doomscroll apps are 1.5x)
   */
  public getDynamicCostMultiplier(app: BlockedApp): number {
    const user = repository.getUser();
    if (!user.dynamicPricingEnabled) return 1.0;

    let multiplier = 1.0;
    const currentHour = new Date().getHours();

    // Night penalty (10:00 PM to 6:00 AM)
    if (currentHour >= 22 || currentHour < 6) {
      multiplier *= 2.0;
    }

    // High risk doomscroll tier penalty
    if (app.riskTier === 'high_risk_doomscroll') {
      multiplier *= 1.5;
    }

    return multiplier;
  }

  /**
   * Called when user attempts to launch an app
   */
  attemptLaunchApp(packageId: string): AppLaunchAttemptResult {
    const apps = repository.getApps();
    const targetApp = apps.find((a) => a.packageId === packageId);

    if (!targetApp) {
      return {
        allowed: true,
        reason: 'NOT_BLOCKED',
        remainingSeconds: 0,
        app: {
          packageId,
          name: packageId,
          iconName: 'Smartphone',
          category: 'social',
          riskTier: 'utility_standard',
          isBlocked: false,
          dailyAllowanceMinutes: 0,
          usedTodayMinutes: 0,
          availableSeconds: 0,
          sessionStartTime: null,
          sessionDurationSeconds: 0,
          isCurrentlyUnlocked: false,
          intermittentCheckMinutes: 15,
        },
        message: 'App is not in blocked list.',
      };
    }

    if (!targetApp.isBlocked) {
      this.activeApp = targetApp;
      this.isBlockedOverlayVisible = false;
      this.notify();
      return {
        allowed: true,
        reason: 'NOT_BLOCKED',
        remainingSeconds: 99999,
        app: targetApp,
        message: `${targetApp.name} is not currently restricted.`,
      };
    }

    // 1. Check if app already has an active unlocked session with time remaining
    const now = Date.now();
    if (targetApp.isCurrentlyUnlocked && targetApp.sessionStartTime) {
      const elapsedSec = Math.floor((now - targetApp.sessionStartTime) / 1000);
      const remainingSec = Math.max(0, targetApp.sessionDurationSeconds - elapsedSec);

      if (remainingSec > 0) {
        this.activeApp = { ...targetApp, availableSeconds: remainingSec };
        this.isBlockedOverlayVisible = false;
        this.notify();
        return {
          allowed: true,
          reason: 'HAS_AVAILABLE_TIME',
          remainingSeconds: remainingSec,
          app: targetApp,
          message: `Access granted! ${Math.ceil(remainingSec / 60)} minutes remaining.`,
        };
      }
    }

    // 2. Check if Central Wallet has earned balance to unlock a session
    const wallet = repository.getWallet();
    const multiplier = this.getDynamicCostMultiplier(targetApp);

    if (wallet.balanceSeconds > 0) {
      this.activeApp = targetApp;
      this.isBlockedOverlayVisible = true;
      soundService.playLockAlert();
      this.notify();
      return {
        allowed: false,
        reason: 'LOCKED_NO_TIME',
        remainingSeconds: wallet.balanceSeconds,
        app: targetApp,
        dynamicCostMultiplier: multiplier,
        message: `🔒 ${targetApp.name} is locked. You have ${Math.floor(
          wallet.balanceSeconds / 60
        )}m balance. (Exchange rate: ${multiplier}x).`,
      };
    }

    // 3. Completely locked — 0 minutes available in wallet
    this.activeApp = targetApp;
    this.isBlockedOverlayVisible = true;
    soundService.playLockAlert();
    this.notify();

    return {
      allowed: false,
      reason: 'LOCKED_NO_TIME',
      remainingSeconds: 0,
      app: targetApp,
      dynamicCostMultiplier: multiplier,
      message: `🔒 ${targetApp.name} is locked. Complete an exercise to earn screen time.`,
    };
  }

  /**
   * Spends screen time from central wallet with dynamic cost scaling
   */
  unlockAppWithEarnedTime(packageId: string, durationMinutes: number = 5): boolean {
    const wallet = repository.getWallet();
    const apps = repository.getApps();
    const targetApp = apps.find((a) => a.packageId === packageId);
    if (!targetApp) return false;

    const multiplier = this.getDynamicCostMultiplier(targetApp);
    const costSeconds = Math.round(durationMinutes * 60 * multiplier);

    if (wallet.balanceSeconds < costSeconds && wallet.balanceSeconds < 60) {
      return false; // Not enough balance
    }

    const actualDeduction = Math.min(wallet.balanceSeconds, costSeconds);
    const sessionDurationSec = durationMinutes * 60;
    const now = Date.now();

    // 1. Record Spending Transaction
    repository.addTransaction({
      type: 'SPEND_APP',
      amountSeconds: -actualDeduction,
      appPackageId: packageId,
      appName: targetApp.name,
      description: `Unlocked ${targetApp.name} for ${durationMinutes} min (${multiplier}x cost factor)`,
      verified: true,
      costMultiplier: multiplier,
    });

    // 2. Update Blocked App Session State
    repository.updateApp(packageId, {
      isCurrentlyUnlocked: true,
      sessionStartTime: now,
      sessionDurationSeconds: sessionDurationSec,
      availableSeconds: sessionDurationSec,
      usedTodayMinutes: (targetApp.usedTodayMinutes || 0) + durationMinutes,
      lastCheckTimestamp: now,
    });

    // 3. Dismiss Blocker Overlay
    this.isBlockedOverlayVisible = false;
    const updatedApps = repository.getApps();
    this.activeApp = updatedApps.find((a) => a.packageId === packageId) || null;
    soundService.playSuccessChime();
    this.notify();

    return true;
  }

  /**
   * Emergency Bypass Unlocking
   */
  unlockWithEmergencyBypass(packageId: string, minutes: number = 5): boolean {
    const now = Date.now();
    const durationSeconds = minutes * 60;
    const apps = repository.getApps();
    const targetApp = apps.find((a) => a.packageId === packageId);

    repository.addTransaction({
      type: 'EMERGENCY_BYPASS',
      amountSeconds: 0,
      appPackageId: packageId,
      appName: targetApp?.name || packageId,
      description: `🚨 Emergency bypass override granted for ${minutes} min (1 unverified session logged)`,
      verified: false,
    });

    repository.updateApp(packageId, {
      isCurrentlyUnlocked: true,
      sessionStartTime: now,
      sessionDurationSeconds: durationSeconds,
      availableSeconds: durationSeconds,
    });

    this.isBlockedOverlayVisible = false;
    const updatedApps = repository.getApps();
    this.activeApp = updatedApps.find((a) => a.packageId === packageId) || null;
    this.notify();
    return true;
  }

  closeBlockerOverlay() {
    this.isBlockedOverlayVisible = false;
    this.notify();
  }

  closeActiveApp() {
    this.activeApp = null;
    this.isBlockedOverlayVisible = false;
    this.notify();
  }

  /**
   * High-precision background watchdog loop checking absolute timestamps & micro-break toll gates
   */
  private startGlobalWatchdog() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = window.setInterval(() => {
      const apps = repository.getApps();
      const now = Date.now();

      apps.forEach((app) => {
        if (app.isCurrentlyUnlocked && app.sessionStartTime) {
          const elapsedSec = Math.floor((now - app.sessionStartTime) / 1000);
          const remainingSec = Math.max(0, app.sessionDurationSeconds - elapsedSec);

          if (remainingSec <= 0) {
            // Time expired! Re-lock the app immediately!
            repository.updateApp(app.packageId, {
              isCurrentlyUnlocked: false,
              sessionStartTime: null,
              sessionDurationSeconds: 0,
              availableSeconds: 0,
            });

            if (this.activeApp && this.activeApp.packageId === app.packageId) {
              this.isBlockedOverlayVisible = true;
              soundService.playLockAlert();
              this.notify();
            }
          }
        }
      });
    }, 1000);
  }
}

export const appBlockerService = new AppBlockerService();
