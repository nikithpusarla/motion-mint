import { INITIAL_ACTIVITIES, repository } from './storageRepository';
import { ActivityResult, ExerciseType, RewardCalculationResult } from '../types';

export type RewardConfig = Record<
  ExerciseType,
  { baseRewardMinutes: number; baseXP: number; perUnit: number }
>;

export const DEFAULT_REWARD_CONFIG: RewardConfig = {
  pushups: { baseRewardMinutes: 5, baseXP: 50, perUnit: 20 },
  squats: { baseRewardMinutes: 5, baseXP: 60, perUnit: 30 },
  circuit_3min: { baseRewardMinutes: 15, baseXP: 150, perUnit: 3 },
  jumping_jacks: { baseRewardMinutes: 6, baseXP: 65, perUnit: 35 },
  pullups: { baseRewardMinutes: 6, baseXP: 70, perUnit: 10 },
  bicep_curls: { baseRewardMinutes: 5, baseXP: 50, perUnit: 20 },
  lunges: { baseRewardMinutes: 5, baseXP: 55, perUnit: 16 },
  plank: { baseRewardMinutes: 5, baseXP: 50, perUnit: 60 },
  yoga_asanas: { baseRewardMinutes: 6, baseXP: 60, perUnit: 30 },
  walking: { baseRewardMinutes: 5, baseXP: 40, perUnit: 2000 },
  running: { baseRewardMinutes: 8, baseXP: 80, perUnit: 1000 },
  stroop_test: { baseRewardMinutes: 4, baseXP: 45, perUnit: 8 },
  dual_nback: { baseRewardMinutes: 5, baseXP: 50, perUnit: 6 },
  meditation: { baseRewardMinutes: 4, baseXP: 45, perUnit: 10 },
  breathing: { baseRewardMinutes: 3, baseXP: 35, perUnit: 5 },
  reading: { baseRewardMinutes: 5, baseXP: 50, perUnit: 15 },
  yoga: { baseRewardMinutes: 5, baseXP: 50, perUnit: 15 },
  sudoku: { baseRewardMinutes: 5, baseXP: 55, perUnit: 1 },
  memory: { baseRewardMinutes: 4, baseXP: 40, perUnit: 5 },
};

export class RewardEngine {
  private config: RewardConfig = DEFAULT_REWARD_CONFIG;
  private processedSessionSignatures: Set<string> = new Set();

  updateConfig(newConfig: Partial<RewardConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): RewardConfig {
    return this.config;
  }

  /**
   * Evaluates standardized ActivityResult and issues screen time & XP with Streak Multipliers
   * Optionally accepts server-verified AIVerificationResult
   */
  processActivityResult(
    result: ActivityResult,
    aiVerification?: import('../types').AIVerificationResult
  ): RewardCalculationResult {
    // 1. Anti-Cheat Session Signature Check
    const sessionSignature = `${result.activityType}_${result.timestamp}_${result.measuredValue}_${result.durationSeconds}`;
    if (this.processedSessionSignatures.has(sessionSignature)) {
      return {
        rewardMinutes: 0,
        rewardSeconds: 0,
        xp: 0,
        bonusMultiplier: 1.0,
        message: 'Duplicate session rejected: rewards already claimed for this workout.',
      };
    }

    // 2. AI Verification Rejection Check
    if (aiVerification && (!aiVerification.verified || aiVerification.isCheatingDetected)) {
      return {
        rewardMinutes: 0,
        rewardSeconds: 0,
        xp: 0,
        bonusMultiplier: 1.0,
        message: `❌ AI Verification Failed: ${
          aiVerification.cheatingReason || 'Task execution could not be verified by Gemini Vision.'
        }`,
      };
    }

    this.processedSessionSignatures.add(sessionSignature);

    // 3. Base Validation
    if (result.confidence < 0.5) {
      return {
        rewardMinutes: 0,
        rewardSeconds: 0,
        xp: 0,
        bonusMultiplier: 1.0,
        message: 'Verification confidence too low. Please ensure clear camera visibility.',
      };
    }

    if (result.measuredValue <= 0) {
      return {
        rewardMinutes: 0,
        rewardSeconds: 0,
        xp: 0,
        bonusMultiplier: 1.0,
        message: 'No completed repetitions or target reached.',
      };
    }

    // 4. Calculation against central config & User Streak Multiplier
    const user = repository.getUser();
    const streakMultiplier = user.streakBonusMultiplier || 1.25;

    const actDef = INITIAL_ACTIVITIES.find((a) => a.id === result.activityType);
    const rule = this.config[result.activityType] || {
      baseRewardMinutes: actDef?.rewardMinutes || 5,
      baseXP: actDef?.xpReward || 50,
      perUnit: actDef?.defaultTarget || 20,
    };

    // Calculate ratio of work done vs base target
    const ratio = Math.min(3.0, Math.max(0.5, result.measuredValue / rule.perUnit));
    let earnedMinutes = Math.round(rule.baseRewardMinutes * ratio * streakMultiplier);
    let earnedXP = Math.round(rule.baseXP * ratio * streakMultiplier);

    // Bonus for high AI form score
    if (aiVerification && aiVerification.formScore >= 90) {
      earnedMinutes += 1;
      earnedXP += 20;
    }

    // 5. Daily Cap Validation
    const wallet = repository.getWallet();
    const currentDailyEarnedMinutes = Math.floor(wallet.dailyEarnedSeconds / 60);
    const maxDailyCapMinutes = Math.floor(wallet.maxDailyCapSeconds / 60);

    if (currentDailyEarnedMinutes + earnedMinutes > maxDailyCapMinutes) {
      earnedMinutes = Math.max(0, maxDailyCapMinutes - currentDailyEarnedMinutes);
    }

    const earnedSeconds = earnedMinutes * 60;

    // 6. Commit to Storage Repository
    if (earnedSeconds > 0) {
      const isCircuit = actDef?.category === 'circuit';
      const isPhysical = actDef?.category === 'physical' || isCircuit;

      repository.addTransaction({
        type: isCircuit ? 'EARN_CIRCUIT' : isPhysical ? 'EARN_PHYSICAL' : 'EARN_MENTAL',
        amountSeconds: earnedSeconds,
        activityId: result.activityType,
        activityName: actDef?.title || result.activityType,
        description: `AI-Verified ${result.measuredValue} ${actDef?.targetUnit || 'units'} of ${
          actDef?.title
        } (+${earnedMinutes} min, ${streakMultiplier}x streak)`,
        verified: true,
        costMultiplier: streakMultiplier,
        aiVerification: aiVerification,
      });

      repository.addXP(earnedXP);

      // Update Challenge progress
      repository.updateChallengeProgress(result.activityType, result.measuredValue);
      repository.updateChallengeProgress('any_activity', 1);
      repository.updateChallengeProgress('total_earned', earnedMinutes);

      // Update User stats
      repository.updateUser({
        totalEarnedMinutes: user.totalEarnedMinutes + earnedMinutes,
        lastActiveDate: new Date().toISOString().split('T')[0],
      });
    }

    return {
      rewardMinutes: earnedMinutes,
      rewardSeconds: earnedSeconds,
      xp: earnedXP,
      bonusMultiplier: streakMultiplier,
      message:
        earnedMinutes > 0
          ? `🎉 +${earnedMinutes} Minutes Screen Time Minted & +${earnedXP} XP Earned (${streakMultiplier}x Streak Multiplier)!`
          : 'Activity completed! Daily reward cap reached for today.',
    };
  }

  /**
   * Process offline habit proof verified via Gemini AI Camera
   */
  processAIVerifiedHabit(
    habitTitle: string,
    habitId: string,
    aiResult: import('../types').AIVerificationResult
  ): RewardCalculationResult {
    if (!aiResult.verified || aiResult.isCheatingDetected) {
      return {
        rewardMinutes: 0,
        rewardSeconds: 0,
        xp: 0,
        bonusMultiplier: 1.0,
        message: `❌ Verification Rejected: ${aiResult.cheatingReason || 'Gemini Vision detected invalid proof'}`,
      };
    }

    const user = repository.getUser();
    const streakMultiplier = user.streakBonusMultiplier || 1.25;

    let baseMinutes = aiResult.verifiedTokensAwarded || 6;
    let earnedMinutes = Math.round(baseMinutes * streakMultiplier);
    let earnedXP = Math.round((aiResult.xpEarned || 50) * streakMultiplier);

    const wallet = repository.getWallet();
    const currentDailyEarnedMinutes = Math.floor(wallet.dailyEarnedSeconds / 60);
    const maxDailyCapMinutes = Math.floor(wallet.maxDailyCapSeconds / 60);

    if (currentDailyEarnedMinutes + earnedMinutes > maxDailyCapMinutes) {
      earnedMinutes = Math.max(0, maxDailyCapMinutes - currentDailyEarnedMinutes);
    }

    const earnedSeconds = earnedMinutes * 60;

    if (earnedSeconds > 0) {
      repository.addTransaction({
        type: 'EARN_MENTAL',
        amountSeconds: earnedSeconds,
        activityId: habitId,
        activityName: habitTitle,
        description: `AI Camera Proof Verified: ${habitTitle} (+${earnedMinutes} min, ${streakMultiplier}x streak)`,
        verified: true,
        costMultiplier: streakMultiplier,
        aiVerification: aiResult,
      });

      repository.addXP(earnedXP);
      repository.updateChallengeProgress('any_activity', 1);
      repository.updateChallengeProgress('total_earned', earnedMinutes);

      repository.updateUser({
        totalEarnedMinutes: user.totalEarnedMinutes + earnedMinutes,
        lastActiveDate: new Date().toISOString().split('T')[0],
      });
    }

    return {
      rewardMinutes: earnedMinutes,
      rewardSeconds: earnedSeconds,
      xp: earnedXP,
      bonusMultiplier: streakMultiplier,
      message: `🎉 +${earnedMinutes} Min Minted & +${earnedXP} XP (${aiResult.badge})!`,
    };
  }
}

export const rewardEngine = new RewardEngine();
