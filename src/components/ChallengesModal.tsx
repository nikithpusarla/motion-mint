import React from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Gift,
  Lock,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { soundService } from '../services/audioService';
import { repository } from '../services/storageRepository';
import { Achievement, Challenge, UserProfile } from '../types';

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  challenges: Challenge[];
  achievements: Achievement[];
}

export const ChallengesModal: React.FC<ChallengesModalProps> = ({
  isOpen,
  onClose,
  user,
  challenges,
  achievements,
}) => {
  if (!isOpen) return null;

  const handleClaim = (challengeId: string) => {
    const res = repository.claimChallenge(challengeId);
    if (res) {
      soundService.playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
      });
    }
  };

  const dailyChallenges = challenges.filter((c) => c.type === 'daily');
  const weeklyChallenges = challenges.filter((c) => c.type === 'weekly');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Gamification &amp; Challenges
              </h2>
              <p className="text-xs text-[#888888]">
                Level {user.level} Warrior • {user.xp} Total XP • 🔥 {user.streak}-day Streak
              </p>
            </div>
          </div>
          <button
            id="close-challenges-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full bg-[#111111] text-[#888888] hover:text-white border border-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Tabs / Sections */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* DAILY QUESTS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#00FF85]" /> Daily Quests
              </span>
              <span className="text-[10px] text-[#888888] font-mono">Resets in 14h</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dailyChallenges.map((ch) => {
                const percent = Math.min(100, Math.round((ch.currentValue / ch.targetValue) * 100));
                return (
                  <div
                    key={ch.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      ch.isClaimed
                        ? 'bg-[#111111]/40 border-[#222222]/60 opacity-60'
                        : ch.isCompleted
                        ? 'bg-[#00FF85]/10 border-[#00FF85]/40'
                        : 'bg-[#111111] border-[#222222]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white">{ch.title}</div>
                        <p className="text-[10px] text-[#888888] mt-0.5">{ch.description}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded border border-[#FF9500]/30 whitespace-nowrap">
                        +{ch.rewardMinutes}m / +{ch.xpReward}XP
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5 mt-3">
                      <div className="flex justify-between text-[10px] text-[#888888]">
                        <span>Progress</span>
                        <span className="font-mono text-white">
                          {ch.currentValue} / {ch.targetValue} {ch.unit}
                        </span>
                      </div>
                      <div className="w-full bg-[#050505] h-2 rounded-full overflow-hidden border border-[#222222]">
                        <div
                          className="bg-gradient-to-r from-[#00A3FF] to-[#00FF85] h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Claim Button */}
                    {ch.isCompleted && !ch.isClaimed && (
                      <button
                        onClick={() => handleClaim(ch.id)}
                        className="w-full mt-3 py-1.5 rounded-xl bg-[#00FF85] hover:bg-[#00e676] text-black font-bold text-xs uppercase tracking-wider shadow cursor-pointer transition-all hover:scale-102"
                      >
                        Claim Reward 🎉
                      </button>
                    )}

                    {ch.isClaimed && (
                      <div className="mt-2 text-center text-[10px] font-bold text-[#00FF85] flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Claimed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* WEEKLY CHALLENGES */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#00A3FF]" /> Weekly Challenge
            </div>

            {weeklyChallenges.map((ch) => {
              const percent = Math.min(100, Math.round((ch.currentValue / ch.targetValue) * 100));
              return (
                <div
                  key={ch.id}
                  className="p-4 rounded-2xl bg-[#111111] border border-[#222222] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{ch.title}</div>
                      <p className="text-xs text-[#888888]">{ch.description}</p>
                    </div>
                    <span className="text-xs font-bold text-[#00A3FF] bg-[#00A3FF]/10 px-2.5 py-1 rounded-xl border border-[#00A3FF]/30">
                      +{ch.rewardMinutes}m / +{ch.xpReward}XP
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[#888888]">
                      <span>Completion</span>
                      <span className="font-mono text-white">
                        {ch.currentValue}/{ch.targetValue} {ch.unit} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#050505] h-2.5 rounded-full overflow-hidden border border-[#222222]">
                      <div
                        className="bg-gradient-to-r from-[#00A3FF] to-[#00FF85] h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACHIEVEMENTS TROPHY GALLERY */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF9500]" /> Lifetime Badges
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    ach.isUnlocked
                      ? 'bg-[#111111] border-[#FF9500]/30'
                      : 'bg-[#111111]/40 border-[#222222]/70 opacity-50'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      ach.isUnlocked
                        ? 'bg-gradient-to-tr from-[#FF9500]/20 to-[#00FF85]/20 text-[#FF9500] border border-[#FF9500]/30 shadow-lg'
                        : 'bg-[#181818] text-[#555555] border border-[#222222]'
                    }`}
                  >
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {ach.title}
                      {ach.isUnlocked && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#FF9500]/20 text-[#FF9500]">
                          {ach.tier}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#888888] mt-0.5">{ach.description}</p>
                    <div className="text-[10px] text-[#00A3FF] font-mono mt-1">
                      {ach.isUnlocked ? 'Unlocked 🎉' : `Progress: ${ach.currentProgress}/${ach.target}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
