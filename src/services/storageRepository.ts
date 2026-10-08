import {
  Achievement,
  ActivityDefinition,
  BlockedApp,
  Challenge,
  ScreenTimeTransaction,
  ScreenTimeWallet,
  UserProfile,
} from '../types';

const STORAGE_KEYS = {
  USER: 'eyst_user_profile_v2',
  WALLET: 'eyst_wallet_v2',
  APPS: 'eyst_blocked_apps_v2',
  TRANSACTIONS: 'eyst_transactions_v2',
  CHALLENGES: 'eyst_challenges_v2',
  ACHIEVEMENTS: 'eyst_achievements_v2',
  SETTINGS: 'eyst_settings_v2',
};

export const INITIAL_ACTIVITIES: ActivityDefinition[] = [
  {
    id: 'pushups',
    title: 'Push-ups',
    category: 'physical',
    description: 'Chest, triceps & core strength verified via camera pose tracking.',
    icon: 'Dumbbell',
    defaultTarget: 20,
    targetUnit: 'reps',
    rewardMinutes: 5,
    xpReward: 50,
    verificationMethod: 'ml_camera',
    instructions: [
      'Position your device 6-8 feet away with your full upper body visible.',
      'Lower your chest until elbows hit <90 degrees depth.',
      'Push back up to full lockout for a valid rep.',
    ],
    tips: ['Keep your spine straight', 'Look slightly forward', 'Consistent tempo'],
    mlSupported: true,
  },
  {
    id: 'squats',
    title: 'Bodyweight Squats',
    category: 'physical',
    description: 'Quadriceps, glutes & leg power verified with hip-knee depth tracking.',
    icon: 'Flame',
    defaultTarget: 30,
    targetUnit: 'reps',
    rewardMinutes: 5,
    xpReward: 60,
    verificationMethod: 'ml_camera',
    instructions: [
      'Stand with feet shoulder-width apart facing the camera.',
      'Squat down until thighs are parallel to the floor (knee angle < 95°).',
      'Stand fully upright at top of rep.',
    ],
    tips: ['Keep heels on ground', 'Chest up', 'Knees tracking over toes'],
    mlSupported: true,
  },
  {
    id: 'circuit_3min',
    title: '⚡ 3-Min Power Circuit',
    category: 'circuit',
    description: '10 Push-ups + 15 Squats + 30s Plank combo for maximum instant screen time.',
    icon: 'Zap',
    defaultTarget: 3,
    targetUnit: 'rounds',
    rewardMinutes: 15,
    xpReward: 150,
    verificationMethod: 'circuit_multistep',
    instructions: [
      'Step 1: Complete 10 Chest Push-ups with full lockout.',
      'Step 2: Complete 15 Thigh-Parallel Squats.',
      'Step 3: Hold 30 Seconds Isometric Plank posture.',
    ],
    tips: ['Transition quickly between exercises', 'Listen to voice coach cues', 'Grants +15 min unlock block'],
    mlSupported: true,
    isCircuit: true,
  },
  {
    id: 'jumping_jacks',
    title: 'Jumping Jacks Cardio',
    category: 'physical',
    description: 'Cardio endurance and rhythm tracking via arm elevation and lateral jump detection.',
    icon: 'Zap',
    defaultTarget: 35,
    targetUnit: 'reps',
    rewardMinutes: 6,
    xpReward: 65,
    verificationMethod: 'ml_camera',
    instructions: [
      'Stand upright facing the camera.',
      'Jump out spreading legs and clapping hands overhead.',
      'Jump back to starting position with hands at your sides.',
    ],
    tips: ['Light on your toes', 'Clap overhead cleanly', 'Consistent aerobic pace'],
    mlSupported: true,
  },
  {
    id: 'bicep_curls',
    title: 'Bicep Curls',
    category: 'physical',
    description: 'Arm flexion kinematics & elbow stabilization from gym-computer-vision-2.',
    icon: 'Dumbbell',
    defaultTarget: 20,
    targetUnit: 'reps',
    rewardMinutes: 5,
    xpReward: 50,
    verificationMethod: 'ml_camera',
    instructions: [
      'Stand facing camera with arms down at your sides.',
      'Curl upward until elbow flexion reaches <35 degrees.',
      'Lower under controlled eccentric tempo to full extension (>160°).',
    ],
    tips: ['Keep elbows pinned to ribs', 'No swinging or momentum', 'Squeeze biceps at peak'],
    mlSupported: true,
  },
  {
    id: 'lunges',
    title: 'Forward Lunges',
    category: 'physical',
    description: 'Unilateral leg endurance & balance tracking with dual-knee angle geometry.',
    icon: 'Flame',
    defaultTarget: 16,
    targetUnit: 'reps',
    rewardMinutes: 5,
    xpReward: 55,
    verificationMethod: 'ml_camera',
    instructions: [
      'Step forward with lead leg, bending both knees to 90 degrees.',
      'Keep torso upright with neutral spine.',
      'Push back up to standing position for verified repetition.',
    ],
    tips: ['Front knee behind toes', 'Chest tall and proud', 'Controlled cadence'],
    mlSupported: true,
  },
  {
    id: 'plank',
    title: 'Core Plank Hold',
    category: 'physical',
    description: 'Isometric core endurance verified with real-time spinal alignment.',
    icon: 'Shield',
    defaultTarget: 60,
    targetUnit: 'seconds',
    rewardMinutes: 5,
    xpReward: 50,
    verificationMethod: 'ml_camera',
    instructions: [
      'Hold a forearm plank with straight spine alignment.',
      'Maintain position for the full 60-second timer.',
      'AI detects if your hips sag or hike up.',
    ],
    tips: ['Squeeze glutes', 'Breathe rhythmically', 'Elbows under shoulders'],
    mlSupported: true,
  },
  {
    id: 'yoga_asanas',
    title: 'Yoga Asanas Alignment',
    category: 'physical',
    description: 'Warrior II, Tree Pose & Downward Dog classified via OpenCV_Yoga-Asanas.',
    icon: 'Smile',
    defaultTarget: 30,
    targetUnit: 'seconds',
    rewardMinutes: 6,
    xpReward: 65,
    verificationMethod: 'ml_camera',
    instructions: [
      'Select your target Asana (Warrior II, Tree Pose, Downward Dog, Cobra).',
      'Move into position; computer vision verifies joint angles and posture alignment.',
      'Hold position steadily until the duration goal is achieved.',
    ],
    tips: ['Breathe evenly through nose', 'Ground evenly through feet', 'Maintain steady gaze (Drishti)'],
    mlSupported: true,
  },
  {
    id: 'walking',
    title: 'Step Goal Walk',
    category: 'physical',
    description: 'Outdoor or indoor walking verified via device pedometer sensors.',
    icon: 'Footprints',
    defaultTarget: 2000,
    targetUnit: 'steps',
    rewardMinutes: 5,
    xpReward: 40,
    verificationMethod: 'sensor_steps',
    instructions: [
      'Walk briskly with your device or sync via Health Connect.',
      'Pedometer tracks cadence and live step updates.',
    ],
    tips: ['Maintain a brisk pace', 'Take stairs when possible'],
    mlSupported: false,
  },
  {
    id: 'stroop_test',
    title: 'Stroop Cognitive Reset',
    category: 'mental',
    description: 'Inhibition control test: Identify color inks while resisting word text impulse.',
    icon: 'Brain',
    defaultTarget: 8,
    targetUnit: 'matches',
    rewardMinutes: 4,
    xpReward: 45,
    verificationMethod: 'interactive_game',
    instructions: [
      'A word appears colored in a different ink (e.g. word "BLUE" written in RED ink).',
      'Select the INK COLOR, not the word text, within 2 seconds.',
      'Pass 8 consecutive rounds to reset dopamine craving.',
    ],
    tips: ['Focus strictly on font pigment', 'Breathe calmly between taps'],
    mlSupported: false,
  },
  {
    id: 'dual_nback',
    title: 'Dual N-Back Working Memory',
    category: 'mental',
    description: 'Working memory training to activate executive prefrontal function.',
    icon: 'Brain',
    defaultTarget: 6,
    targetUnit: 'rounds',
    rewardMinutes: 5,
    xpReward: 50,
    verificationMethod: 'interactive_game',
    instructions: [
      'Remember spatial grid position from N steps ago.',
      'Tap Match when current position equals the position 2 steps back.',
    ],
    tips: ['Maintain active mental rehearsal', 'Strengthens prefrontal focus'],
    mlSupported: false,
  },
  {
    id: 'breathing',
    title: 'Box Breathing (4-4-4-4)',
    category: 'mental',
    description: 'Navy SEAL stress-reduction technique for emotional regulation.',
    icon: 'Wind',
    defaultTarget: 5,
    targetUnit: 'minutes',
    rewardMinutes: 3,
    xpReward: 35,
    verificationMethod: 'timer_focus',
    instructions: [
      'Inhale for 4s, Hold for 4s, Exhale for 4s, Hold for 4s.',
      'Follow the animated breathing polygon pacing indicator.',
    ],
    tips: ['Deep belly breathing', 'Relax shoulders'],
    mlSupported: false,
  },
  {
    id: 'meditation',
    title: 'Mindful Meditation',
    category: 'mental',
    description: 'Calm your mind and build impulse control with guided soundscapes.',
    icon: 'Smile',
    defaultTarget: 10,
    targetUnit: 'minutes',
    rewardMinutes: 4,
    xpReward: 45,
    verificationMethod: 'timer_focus',
    instructions: [
      'Find a quiet, seated position and close your eyes.',
      'Listen to the acoustic bell and maintain steady awareness.',
      'App detects if you leave the screen.',
    ],
    tips: ['Focus on natural breath rhythm', 'Gently return when distracted'],
    mlSupported: false,
  },
];

export const DEFAULT_BLOCKED_APPS: BlockedApp[] = [
  {
    packageId: 'com.instagram.android',
    name: 'Instagram (Reels)',
    iconName: 'Instagram',
    category: 'social',
    riskTier: 'high_risk_doomscroll',
    isBlocked: true,
    dailyAllowanceMinutes: 15,
    usedTodayMinutes: 0,
    availableSeconds: 0,
    sessionStartTime: null,
    sessionDurationSeconds: 0,
    isCurrentlyUnlocked: false,
    intermittentCheckMinutes: 10,
  },
  {
    packageId: 'com.zhiliaoapp.musically',
    name: 'TikTok',
    iconName: 'Video',
    category: 'social',
    riskTier: 'high_risk_doomscroll',
    isBlocked: true,
    dailyAllowanceMinutes: 0,
    usedTodayMinutes: 0,
    availableSeconds: 0,
    sessionStartTime: null,
    sessionDurationSeconds: 0,
    isCurrentlyUnlocked: false,
    intermittentCheckMinutes: 8,
  },
  {
    packageId: 'com.google.android.youtube',
    name: 'YouTube Shorts',
    iconName: 'Youtube',
    category: 'video',
    riskTier: 'high_risk_doomscroll',
    isBlocked: true,
    dailyAllowanceMinutes: 20,
    usedTodayMinutes: 0,
    availableSeconds: 0,
    sessionStartTime: null,
    sessionDurationSeconds: 0,
    isCurrentlyUnlocked: false,
    intermittentCheckMinutes: 10,
  },
  {
    packageId: 'com.reddit.frontpage',
    name: 'Reddit Feed',
    iconName: 'Compass',
    category: 'social',
    riskTier: 'moderate_entertainment',
    isBlocked: true,
    dailyAllowanceMinutes: 15,
    usedTodayMinutes: 0,
    availableSeconds: 0,
    sessionStartTime: null,
    sessionDurationSeconds: 0,
    isCurrentlyUnlocked: false,
    intermittentCheckMinutes: 15,
  },
  {
    packageId: 'com.snapchat.android',
    name: 'Snapchat Spotlight',
    iconName: 'MessageCircle',
    category: 'social',
    riskTier: 'high_risk_doomscroll',
    isBlocked: true,
    dailyAllowanceMinutes: 10,
    usedTodayMinutes: 0,
    availableSeconds: 0,
    sessionStartTime: null,
    sessionDurationSeconds: 0,
    isCurrentlyUnlocked: false,
    intermittentCheckMinutes: 10,
  },
  {
    packageId: 'com.twitter.android',
    name: 'X (Twitter)',
    iconName: 'Hash',
    category: 'social',
    riskTier: 'moderate_entertainment',
    isBlocked: false,
    dailyAllowanceMinutes: 10,
    usedTodayMinutes: 0,
    availableSeconds: 0,
    sessionStartTime: null,
    sessionDurationSeconds: 0,
    isCurrentlyUnlocked: false,
    intermittentCheckMinutes: 15,
  },
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'daily_pushups',
    title: 'Daily Push-up Power',
    description: 'Complete 30 verified push-ups today',
    type: 'daily',
    activityType: 'pushups',
    targetValue: 30,
    currentValue: 0,
    unit: 'reps',
    rewardMinutes: 5,
    xpReward: 100,
    isCompleted: false,
    isClaimed: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'daily_circuit',
    title: '⚡ 3-Min Power Circuit Champion',
    description: 'Complete one full 3-step physical power circuit',
    type: 'daily',
    activityType: 'circuit_3min',
    targetValue: 1,
    currentValue: 0,
    unit: 'circuit',
    rewardMinutes: 15,
    xpReward: 150,
    isCompleted: false,
    isClaimed: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'daily_stroop',
    title: 'Cognitive Shield Focus',
    description: 'Pass the Stroop Test impulse control challenge',
    type: 'daily',
    activityType: 'stroop_test',
    targetValue: 8,
    currentValue: 0,
    unit: 'matches',
    rewardMinutes: 5,
    xpReward: 80,
    isCompleted: false,
    isClaimed: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'weekly_iron_focus',
    title: 'Iron Discipline Week',
    description: 'Earn 120 total minutes of screen time through workouts',
    type: 'weekly',
    activityType: 'total_earned',
    targetValue: 120,
    currentValue: 30,
    unit: 'minutes',
    rewardMinutes: 20,
    xpReward: 300,
    isCompleted: false,
    isClaimed: false,
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_activity',
    title: 'First Step to Freedom',
    description: 'Completed your first verified workout or mental exercise.',
    icon: 'Sparkles',
    tier: 'bronze',
    target: 1,
    currentProgress: 1,
    isUnlocked: true,
    unlockedAt: Date.now() - 3600000,
    xpReward: 100,
  },
  {
    id: 'circuit_hero',
    title: 'Circuit Master',
    description: 'Completed a 3-exercise combined power circuit.',
    icon: 'Zap',
    tier: 'silver',
    target: 1,
    currentProgress: 1,
    isUnlocked: true,
    unlockedAt: Date.now() - 1800000,
    xpReward: 150,
  },
  {
    id: 'streak_3',
    title: 'Momentum Builder',
    description: 'Maintained a 3-day consecutive activity streak (1.25x Multiplier active).',
    icon: 'Flame',
    tier: 'silver',
    target: 3,
    currentProgress: 3,
    isUnlocked: true,
    unlockedAt: Date.now() - 86400000,
    xpReward: 200,
  },
  {
    id: 'vault_staker',
    title: 'Screen Time Banker',
    description: 'Saved 30+ minutes into your weekend vault.',
    icon: 'Shield',
    tier: 'gold',
    target: 30,
    currentProgress: 15,
    isUnlocked: false,
    xpReward: 300,
  },
];

class StorageRepository {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private ensureInitialized() {
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      const initialUser: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: 'Alex Mercer',
        email: 'alex.focus@student.edu',
        xp: 420,
        level: 3,
        streak: 4,
        streakBonusMultiplier: 1.25, // 4-day streak grants 25% extra screen time
        totalEarnedMinutes: 85,
        totalUsedMinutes: 45,
        lastActiveDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
        voiceCoachEnabled: true,
        strictModeEnabled: false,
        dynamicPricingEnabled: true,
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(initialUser));
    }

    if (!localStorage.getItem(STORAGE_KEYS.WALLET)) {
      const initialWallet: ScreenTimeWallet = {
        balanceSeconds: 1800, // 30 minutes welcome balance
        vaultSavedSeconds: 900, // 15 minutes in weekend vault
        totalEarnedSeconds: 5100,
        totalUsedSeconds: 2700,
        dailyEarnedSeconds: 1800,
        dailyUsedSeconds: 600,
        dailyAllowanceAvailableSeconds: 1200,
        maxDailyCapSeconds: 7200, // 2 hours max earnable per day
        lastResetDate: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(initialWallet));
    }

    if (!localStorage.getItem(STORAGE_KEYS.APPS)) {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(DEFAULT_BLOCKED_APPS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      const initialTransactions: ScreenTimeTransaction[] = [
        {
          id: 'tx_welcome_init',
          type: 'WELCOME_BONUS',
          amountSeconds: 1800,
          description: '🎉 Welcome Gift: 30 minutes initial screen time balance',
          timestamp: Date.now() - 3600000 * 5,
          balanceAfterSeconds: 1800,
          verified: true,
        },
        {
          id: 'tx_circuit_1',
          type: 'EARN_CIRCUIT',
          amountSeconds: 900,
          activityId: 'circuit_3min',
          activityName: '3-Min Power Circuit',
          description: 'Verified Push-up + Squat + Plank Circuit (+15 min, 1.25x Streak Bonus)',
          timestamp: Date.now() - 3600000 * 2,
          balanceAfterSeconds: 2700,
          verified: true,
          costMultiplier: 1.25,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CHALLENGES)) {
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(INITIAL_CHALLENGES));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
    }
  }

  // --- USER PROFILE ---
  getUser(): UserProfile {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : ({} as UserProfile);
  }

  updateUser(updater: Partial<UserProfile> | ((prev: UserProfile) => UserProfile)): UserProfile {
    const current = this.getUser();
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- WALLET ---
  getWallet(): ScreenTimeWallet {
    this.checkDailyReset();
    const data = localStorage.getItem(STORAGE_KEYS.WALLET);
    return data ? JSON.parse(data) : ({} as ScreenTimeWallet);
  }

  updateWallet(
    updater: Partial<ScreenTimeWallet> | ((prev: ScreenTimeWallet) => ScreenTimeWallet)
  ): ScreenTimeWallet {
    const current = this.getWallet();
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- VAULT STAKING ---
  depositToVault(seconds: number): boolean {
    const wallet = this.getWallet();
    if (wallet.balanceSeconds < seconds) return false;

    this.updateWallet({
      balanceSeconds: wallet.balanceSeconds - seconds,
      vaultSavedSeconds: wallet.vaultSavedSeconds + seconds,
    });

    this.addTransaction({
      type: 'VAULT_DEPOSIT',
      amountSeconds: -seconds,
      description: `🔒 Staked ${Math.round(seconds / 60)} min into Weekend Vault`,
      verified: true,
    });
    return true;
  }

  withdrawFromVault(seconds: number): boolean {
    const wallet = this.getWallet();
    if (wallet.vaultSavedSeconds < seconds) return false;

    this.updateWallet({
      balanceSeconds: wallet.balanceSeconds + seconds,
      vaultSavedSeconds: wallet.vaultSavedSeconds - seconds,
    });

    this.addTransaction({
      type: 'VAULT_WITHDRAW',
      amountSeconds: seconds,
      description: `🔓 Unlocked ${Math.round(seconds / 60)} min from Weekend Vault`,
      verified: true,
    });
    return true;
  }

  private checkDailyReset() {
    const today = new Date().toISOString().split('T')[0];
    const data = localStorage.getItem(STORAGE_KEYS.WALLET);
    if (!data) return;
    const wallet: ScreenTimeWallet = JSON.parse(data);
    if (wallet.lastResetDate !== today) {
      wallet.dailyEarnedSeconds = 0;
      wallet.dailyUsedSeconds = 0;
      wallet.lastResetDate = today;
      localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));

      const apps = this.getApps().map((app) => ({
        ...app,
        usedTodayMinutes: 0,
      }));
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(apps));
    }
  }

  // --- BLOCKED APPS ---
  getApps(): BlockedApp[] {
    const data = localStorage.getItem(STORAGE_KEYS.APPS);
    const apps: BlockedApp[] = data ? JSON.parse(data) : DEFAULT_BLOCKED_APPS;

    const now = Date.now();
    let changed = false;

    const updatedApps = apps.map((app) => {
      if (app.isCurrentlyUnlocked && app.sessionStartTime) {
        const elapsedSec = Math.floor((now - app.sessionStartTime) / 1000);
        const remaining = Math.max(0, app.sessionDurationSeconds - elapsedSec);
        if (remaining <= 0) {
          changed = true;
          return {
            ...app,
            isCurrentlyUnlocked: false,
            availableSeconds: 0,
            sessionStartTime: null,
            sessionDurationSeconds: 0,
          };
        } else {
          return {
            ...app,
            availableSeconds: remaining,
          };
        }
      }
      return app;
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(updatedApps));
    }

    return updatedApps;
  }

  updateApp(packageId: string, updates: Partial<BlockedApp>): BlockedApp[] {
    const apps = this.getApps();
    const updated = apps.map((app) =>
      app.packageId === packageId ? { ...app, ...updates } : app
    );
    localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  toggleAppBlock(packageId: string): BlockedApp[] {
    const apps = this.getApps();
    const updated = apps.map((app) =>
      app.packageId === packageId ? { ...app, isBlocked: !app.isBlocked } : app
    );
    localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- TRANSACTIONS ---
  getTransactions(): ScreenTimeTransaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  addTransaction(
    tx: Omit<ScreenTimeTransaction, 'id' | 'timestamp' | 'balanceAfterSeconds'>
  ): ScreenTimeTransaction {
    const wallet = this.getWallet();
    const newBalance = Math.max(0, wallet.balanceSeconds + tx.amountSeconds);

    const fullTx: ScreenTimeTransaction = {
      ...tx,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      balanceAfterSeconds: newBalance,
    };

    const txs = [fullTx, ...this.getTransactions()];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs.slice(0, 100)));

    this.updateWallet({
      balanceSeconds: newBalance,
      totalEarnedSeconds:
        tx.amountSeconds > 0
          ? wallet.totalEarnedSeconds + tx.amountSeconds
          : wallet.totalEarnedSeconds,
      totalUsedSeconds:
        tx.amountSeconds < 0
          ? wallet.totalUsedSeconds + Math.abs(tx.amountSeconds)
          : wallet.totalUsedSeconds,
      dailyEarnedSeconds:
        tx.amountSeconds > 0
          ? wallet.dailyEarnedSeconds + tx.amountSeconds
          : wallet.dailyEarnedSeconds,
      dailyUsedSeconds:
        tx.amountSeconds < 0
          ? wallet.dailyUsedSeconds + Math.abs(tx.amountSeconds)
          : wallet.dailyUsedSeconds,
    });

    this.notify();
    return fullTx;
  }

  // --- CHALLENGES ---
  getChallenges(): Challenge[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    return data ? JSON.parse(data) : INITIAL_CHALLENGES;
  }

  updateChallengeProgress(activityType: string, amount: number) {
    const challenges = this.getChallenges();
    const updated = challenges.map((ch) => {
      if (ch.isCompleted) return ch;
      if (ch.activityType === activityType || ch.activityType === 'any_activity') {
        const newVal = ch.currentValue + amount;
        const completed = newVal >= ch.targetValue;
        return {
          ...ch,
          currentValue: Math.min(newVal, ch.targetValue),
          isCompleted: completed,
        };
      }
      return ch;
    });
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));
    this.notify();
  }

  claimChallenge(challengeId: string): Challenge | null {
    const challenges = this.getChallenges();
    const target = challenges.find((c) => c.id === challengeId);
    if (!target || !target.isCompleted || target.isClaimed) return null;

    target.isClaimed = true;
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));

    this.addTransaction({
      type: 'CHALLENGE_REWARD',
      amountSeconds: target.rewardMinutes * 60,
      description: `🏆 Challenge Claimed: ${target.title} (+${target.rewardMinutes} min)`,
      verified: true,
    });

    this.addXP(target.xpReward);
    this.notify();
    return target;
  }

  // --- ACHIEVEMENTS ---
  getAchievements(): Achievement[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : INITIAL_ACHIEVEMENTS;
  }

  // --- XP & LEVEL SYSTEM ---
  addXP(amount: number) {
    const user = this.getUser();
    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 200) + 1;
    this.updateUser({
      xp: newXP,
      level: newLevel,
    });
  }

  // --- RESET / SEED ---
  resetAllData() {
    localStorage.clear();
    this.ensureInitialized();
    this.notify();
  }
}

export const repository = new StorageRepository();
