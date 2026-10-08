export type ActivityCategory = 'physical' | 'mental' | 'circuit';

export type ExerciseType =
  | 'pushups'
  | 'squats'
  | 'pullups'
  | 'bicep_curls'
  | 'lunges'
  | 'jumping_jacks'
  | 'plank'
  | 'circuit_3min'
  | 'yoga_asanas'
  | 'walking'
  | 'running'
  | 'meditation'
  | 'breathing'
  | 'reading'
  | 'yoga'
  | 'sudoku'
  | 'memory'
  | 'stroop_test'
  | 'dual_nback';

export type MLModelEngineType = 'gym_cv2' | 'opencv_yoga' | 'blazepose_33' | 'hybrid_auto';

export type YogaAsanaPose =
  | 'warrior_2'
  | 'tree_pose'
  | 'downward_dog'
  | 'cobra_pose'
  | 'triangle_pose'
  | 'plank_pose';

export type VerificationMethod =
  | 'ml_camera'
  | 'sensor_steps'
  | 'timer_focus'
  | 'interactive_game'
  | 'manual_verified'
  | 'circuit_multistep';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  streakBonusMultiplier: number;
  totalEarnedMinutes: number;
  totalUsedMinutes: number;
  lastActiveDate: string;
  createdAt: string;
  onboardingCompleted: boolean;
  voiceCoachEnabled: boolean;
  strictModeEnabled: boolean;
  dynamicPricingEnabled: boolean;
}

export type AppRiskTier = 'high_risk_doomscroll' | 'moderate_entertainment' | 'utility_standard';

export interface BlockedApp {
  packageId: string;
  name: string;
  iconName: string;
  category: 'social' | 'video' | 'entertainment' | 'gaming' | 'browsing';
  riskTier: AppRiskTier;
  isBlocked: boolean;
  dailyAllowanceMinutes: number;
  usedTodayMinutes: number;
  availableSeconds: number;
  sessionStartTime: number | null;
  sessionDurationSeconds: number;
  isCurrentlyUnlocked: boolean;
  intermittentCheckMinutes: number;
  lastCheckTimestamp?: number;
}

export interface ScreenTimeWallet {
  balanceSeconds: number;
  vaultSavedSeconds: number;
  totalEarnedSeconds: number;
  totalUsedSeconds: number;
  dailyEarnedSeconds: number;
  dailyUsedSeconds: number;
  dailyAllowanceAvailableSeconds: number;
  maxDailyCapSeconds: number;
  lastResetDate: string;
}

export type TransactionType =
  | 'WELCOME_BONUS'
  | 'EARN_PHYSICAL'
  | 'EARN_MENTAL'
  | 'EARN_CIRCUIT'
  | 'SPEND_APP'
  | 'EMERGENCY_BYPASS'
  | 'VAULT_DEPOSIT'
  | 'VAULT_WITHDRAW'
  | 'DAILY_RESET'
  | 'CHALLENGE_REWARD';

export interface ScreenTimeTransaction {
  id: string;
  type: TransactionType;
  amountSeconds: number;
  appPackageId?: string;
  appName?: string;
  activityId?: string;
  activityName?: string;
  description: string;
  timestamp: number;
  balanceAfterSeconds: number;
  verified: boolean;
  costMultiplier?: number;
  aiVerification?: AIVerificationResult;
}

export interface CircuitStep {
  stepId: number;
  name: string;
  exerciseType: ExerciseType;
  targetRepsOrSec: number;
  completed: boolean;
}

export interface ActivityDefinition {
  id: ExerciseType;
  title: string;
  category: ActivityCategory;
  description: string;
  icon: string;
  defaultTarget: number;
  targetUnit: string;
  rewardMinutes: number;
  xpReward: number;
  verificationMethod: VerificationMethod;
  instructions: string[];
  tips: string[];
  mlSupported: boolean;
  isCircuit?: boolean;
}

export interface ActivityResult {
  activityId: ExerciseType;
  activityType: ExerciseType;
  target: number;
  measuredValue: number;
  confidence: number;
  completed: boolean;
  verificationMethod: VerificationMethod;
  durationSeconds: number;
  repLogs?: { repNumber: number; timestamp: number; formScore: number }[];
  timestamp: number;
}

export interface RewardCalculationResult {
  rewardMinutes: number;
  rewardSeconds: number;
  xp: number;
  bonusMultiplier: number;
  message: string;
  unlockedAppPackageId?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  activityType: ExerciseType | 'any_activity' | 'total_earned';
  targetValue: number;
  currentValue: number;
  unit: string;
  rewardMinutes: number;
  xpReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  expiresAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  target: number;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: number;
  xpReward: number;
}

export interface ExerciseFrameResult {
  exerciseType: ExerciseType;
  repCount: number;
  currentPhase: 'UP' | 'DOWN' | 'HOLD' | 'PREPARING';
  formScore: number;
  confidence: number;
  feedbackMessage: string;
  voiceCue?: string;
  sourceEngine?: string;
  detectedAsana?: YogaAsanaPose;
  asanaName?: string;
  postureStability?: number;
  holdDurationSeconds?: number;
  angles: {
    primaryAngle: number;
    secondaryAngle?: number;
    leftElbow?: number;
    rightElbow?: number;
    leftKnee?: number;
    rightKnee?: number;
    leftHip?: number;
    rightHip?: number;
    torsoAngle?: number;
    shoulderAlignment?: number;
  };
  landmarkPoints?: { x: number; y: number; visibility: number }[];
}

export interface EmergencyBypassTier {
  id: string;
  durationMinutes: number;
  priceUsd: number;
  cooldownHours: number;
  description: string;
  requiresRepentanceReps?: number;
}

export interface AIVerificationResult {
  verified: boolean;
  authenticityScore: number;
  formScore: number;
  effortRating: 'low' | 'moderate' | 'high' | 'elite';
  detectedActivity: string;
  isCheatingDetected: boolean;
  cheatingReason?: string | null;
  coachFeedback: string;
  formCorrections: string[];
  verifiedTokensAwarded: number;
  xpEarned: number;
  badge: string;
  isSyntheticFallback?: boolean;
  verifiedAt: number;
  capturedImages?: string[];
}

export interface AIVerificationPayload {
  taskType: string;
  taskTitle: string;
  category?: ActivityCategory | 'habit_proof';
  targetValue: number;
  measuredValue: number;
  unit?: string;
  images: string[];
  userNotes?: string;
  formMetrics?: Record<string, any>;
}

export interface AIProofHabit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'offline_habit' | 'dopamine_detox' | 'deep_work';
  tokenReward: number;
  xpReward: number;
  promptInstructions: string;
  exampleProof: string;
  targetCount: number;
  unit: string;
}

