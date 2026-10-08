import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Brain,
  ChevronLeft,
  Grid,
  Pause,
  Play,
  Smile,
  Sparkles,
  BookOpen,
  Zap,
  Camera,
  ShieldCheck,
} from 'lucide-react';
import { soundService } from '../services/audioService';
import { rewardEngine } from '../services/rewardEngine';
import { AICameraProofModal } from './AICameraProofModal';
import { INITIAL_ACTIVITIES } from '../services/storageRepository';
import { ActivityResult, ExerciseType, RewardCalculationResult } from '../types';
import { ActivityIcon, getActivityVisualMeta } from './ActivityIcon';

interface MentalExerciseViewProps {
  exerciseType: ExerciseType;
  onClose: () => void;
  onRewardClaimed: (result: RewardCalculationResult) => void;
}

interface StroopItem {
  word: string;
  colorName: string;
  colorHex: string;
}

const STROOP_COLORS = [
  { name: 'RED', hex: '#EF4444' },
  { name: 'BLUE', hex: '#3B82F6' },
  { name: 'GREEN', hex: '#10B981' },
  { name: 'YELLOW', hex: '#F59E0B' },
  { name: 'PURPLE', hex: '#8B5CF6' },
];

export const MentalExerciseView: React.FC<MentalExerciseViewProps> = ({
  exerciseType,
  onClose,
  onRewardClaimed,
}) => {
  const activityDef =
    INITIAL_ACTIVITIES.find((a) => a.id === exerciseType) || INITIAL_ACTIVITIES[5];

  // Common Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [rewardResult, setRewardResult] = useState<RewardCalculationResult | null>(null);
  const [isCameraProofOpen, setIsCameraProofOpen] = useState(false);

  // Box Breathing State
  const [breathPhase, setBreathPhase] = useState<
    'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'
  >('Inhale');
  const [breathCount, setBreathCount] = useState(4);

  // Stroop Test State (Cognitive Inhibition)
  const [stroopRound, setStroopRound] = useState(1);
  const [stroopStreak, setStroopStreak] = useState(0);
  const [currentStroop, setCurrentStroop] = useState<StroopItem | null>(null);

  // Dual N-Back State (Working memory)
  const [nbackRound, setNbackRound] = useState(1);
  const [nbackHistory, setNbackHistory] = useState<number[]>([]);
  const [currentNbackTile, setCurrentNbackTile] = useState<number | null>(null);
  const [nbackFeedback, setNbackFeedback] = useState<string>('Remember position 2 steps back');

  // Memory Matrix Game State
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [memoryRound, setMemoryRound] = useState(1);
  const [activeHighlightTile, setActiveHighlightTile] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);

  // Sudoku Board
  const [sudokuBoard, setSudokuBoard] = useState<number[][]>([
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

  // Reading Quiz State
  const [quizAnswer1, setQuizAnswer1] = useState<string>('');

  const targetDurationSeconds = (activityDef.defaultTarget || 5) * 60;

  // General Timer Effect
  useEffect(() => {
    let interval: number | null = null;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev + 1;
          if (next >= targetDurationSeconds && !rewardResult) {
            handleCompleteMentalSession();
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, targetDurationSeconds, rewardResult]);

  // Box Breathing Loop
  useEffect(() => {
    let breathInterval: number | null = null;
    if (exerciseType === 'breathing' && isTimerRunning) {
      breathInterval = window.setInterval(() => {
        setBreathCount((c) => {
          if (c <= 1) {
            setBreathPhase((prev) => {
              if (prev === 'Inhale') return 'Hold (Full)';
              if (prev === 'Hold (Full)') return 'Exhale';
              if (prev === 'Exhale') return 'Hold (Empty)';
              return 'Inhale';
            });
            return 4;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => {
      if (breathInterval) clearInterval(breathInterval);
    };
  }, [exerciseType, isTimerRunning]);

  // --- STROOP TEST LOGIC ---
  const generateNewStroop = () => {
    const wordObj = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    let colorObj = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    // Ensure interference mismatch 70% of time
    if (Math.random() > 0.3) {
      while (colorObj.name === wordObj.name) {
        colorObj = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
      }
    }
    setCurrentStroop({
      word: wordObj.name,
      colorName: colorObj.name,
      colorHex: colorObj.hex,
    });
  };

  const startStroopTest = () => {
    setStroopRound(1);
    setStroopStreak(0);
    generateNewStroop();
  };

  const handleStroopAnswer = (selectedColorName: string) => {
    if (!currentStroop) return;

    if (selectedColorName === currentStroop.colorName) {
      soundService.playRepBeep(stroopStreak + 1);
      const nextStreak = stroopStreak + 1;
      setStroopStreak(nextStreak);
      setStroopRound((r) => r + 1);

      if (nextStreak >= 8) {
        handleCompleteMentalSession(8);
      } else {
        generateNewStroop();
      }
    } else {
      soundService.playLockAlert();
      soundService.speakCoachCue('Focus on ink color!');
      setStroopStreak(0);
      generateNewStroop();
    }
  };

  // --- DUAL N-BACK LOGIC ---
  const startDualNback = () => {
    setNbackRound(1);
    const firstTile = Math.floor(Math.random() * 9);
    setNbackHistory([firstTile]);
    setCurrentNbackTile(firstTile);
    setNbackFeedback('Round 1: Memorize position');
  };

  const handleNbackNext = (claimedMatch: boolean) => {
    if (nbackHistory.length < 2) {
      const nextTile = Math.floor(Math.random() * 9);
      const newHist = [...nbackHistory, nextTile];
      setNbackHistory(newHist);
      setCurrentNbackTile(nextTile);
      setNbackRound((r) => r + 1);
      setNbackFeedback('Round 2: Keep tracking positions...');
      return;
    }

    const nBackTarget = nbackHistory[nbackHistory.length - 2];
    const current = nbackHistory[nbackHistory.length - 1];
    const isActualMatch = nBackTarget === current;

    if (claimedMatch === isActualMatch) {
      soundService.playRepBeep(nbackRound);
      setNbackFeedback('Correct match!');
      if (nbackRound >= 6) {
        handleCompleteMentalSession(6);
        return;
      }
    } else {
      soundService.playLockAlert();
      setNbackFeedback('Mismatch detected. Resetting...');
    }

    const nextTile =
      Math.random() > 0.5 ? nBackTarget : Math.floor(Math.random() * 9);
    setNbackHistory([...nbackHistory, nextTile]);
    setCurrentNbackTile(nextTile);
    setNbackRound((r) => r + 1);
  };

  // --- MEMORY MATRIX ---
  const startMemoryGame = () => {
    setMemoryRound(1);
    setPlayerSequence([]);
    const firstSeq = [Math.floor(Math.random() * 9)];
    setMemorySequence(firstSeq);
    playMemorySequence(firstSeq);
  };

  const playMemorySequence = (seq: number[]) => {
    setIsShowingSequence(true);
    seq.forEach((tileIdx, i) => {
      setTimeout(() => {
        setActiveHighlightTile(tileIdx);
        soundService.playRepBeep(tileIdx + 1);
        setTimeout(() => setActiveHighlightTile(null), 400);
      }, (i + 1) * 600);
    });

    setTimeout(() => {
      setIsShowingSequence(false);
      setPlayerSequence([]);
    }, (seq.length + 1) * 600);
  };

  const handleTileClick = (tileIdx: number) => {
    if (isShowingSequence || rewardResult) return;
    soundService.playRepBeep(tileIdx + 1);

    const nextPlayerSeq = [...playerSequence, tileIdx];
    setPlayerSequence(nextPlayerSeq);

    const currentIndex = playerSequence.length;
    if (memorySequence[currentIndex] !== tileIdx) {
      soundService.playLockAlert();
      startMemoryGame();
      return;
    }

    if (nextPlayerSeq.length === memorySequence.length) {
      if (memoryRound >= 5) {
        handleCompleteMentalSession(5);
      } else {
        const nextRound = memoryRound + 1;
        setMemoryRound(nextRound);
        const nextSeq = [...memorySequence, Math.floor(Math.random() * 9)];
        setMemorySequence(nextSeq);
        setTimeout(() => playMemorySequence(nextSeq), 800);
      }
    }
  };

  // --- SUDOKU INPUT ---
  const handleSudokuInput = (num: number) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    const nextBoard = sudokuBoard.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? num : val))
    );
    setSudokuBoard(nextBoard);

    const isFull = nextBoard.every((row) => row.every((cell) => cell > 0));
    if (isFull) {
      handleCompleteMentalSession(1);
    }
  };

  const handleCompleteMentalSession = (overrideValue?: number) => {
    setIsTimerRunning(false);
    soundService.playSuccessChime();

    const measured = overrideValue || Math.max(1, Math.round(timerSeconds / 60));

    const result: ActivityResult = {
      activityId: exerciseType,
      activityType: exerciseType,
      target: activityDef.defaultTarget,
      measuredValue: measured,
      confidence: 0.95,
      completed: true,
      verificationMethod: activityDef.verificationMethod,
      durationSeconds: Math.max(timerSeconds, 60),
      timestamp: Date.now(),
    };

    const reward = rewardEngine.processActivityResult(result);
    setRewardResult(reward);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col overflow-y-auto">
      {/* Top Header Bar */}
      <div className="bg-[#0A0A0A] border-b border-[#222222] px-4 py-3 flex items-center justify-between">
        <button
          id="back-from-mental-exercise-btn"
          onClick={onClose}
          className="flex items-center gap-1.5 text-[#888888] hover:text-white text-xs font-semibold py-1.5 px-3 rounded-lg bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <ActivityIcon
            activityId={exerciseType}
            iconName={activityDef.icon}
            category={activityDef.category}
            size="md"
            showBadge={true}
            interactive={true}
          />
          <div>
            <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{activityDef.title}</span>
            </div>
            <div className="text-[10px] text-[#86868B] font-mono">
              Reward: +{activityDef.rewardMinutes} min screen time • +{activityDef.xpReward} XP
            </div>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#111111] border border-[#222222] text-[#00FF85]">
          Cognitive Gating Active
        </span>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-center">
        {/* VIEW 1: Stroop Test (Cognitive Inhibition) */}
        {exerciseType === 'stroop_test' && (
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#888888]">
                Stroop Inhibition Test
              </span>
              <span className="text-xs text-[#00FF85] font-mono font-bold">
                Streak: {stroopStreak} / 8
              </span>
            </div>

            {currentStroop ? (
              <div className="py-8 space-y-6">
                <div className="text-xs text-[#888888]">
                  Select the <strong className="text-white">INK COLOR</strong>, ignore the written word:
                </div>
                <div
                  className="text-6xl font-black font-display tracking-wider transition-all scale-105"
                  style={{ color: currentStroop.colorHex }}
                >
                  {currentStroop.word}
                </div>

                {/* Color Choice Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-4">
                  {STROOP_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => handleStroopAnswer(c.name)}
                      className="py-3 px-4 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] text-xs font-bold text-white transition-all cursor-pointer hover:scale-102 flex items-center justify-center gap-2"
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="w-16 h-16 rounded-2xl bg-[#00A3FF]/10 border border-[#00A3FF]/30 flex items-center justify-center mx-auto text-[#00A3FF]">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-white">
                    Stroop Cognitive Reset
                  </h3>
                  <p className="text-xs text-[#888888] mt-1">
                    Forces executive inhibition control. Pick the font color (not the word text) 8 times to unlock your app!
                  </p>
                </div>
                <button
                  id="start-stroop-test-btn"
                  onClick={startStroopTest}
                  className="w-full py-3.5 rounded-xl bg-[#00FF85] text-black font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-[#00FF85]/20"
                >
                  Start Stroop Challenge
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Dual N-Back Working Memory */}
        {exerciseType === 'dual_nback' && (
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#888888]">
                2-Back Working Memory
              </span>
              <span className="text-xs text-[#00A3FF] font-mono font-bold">
                Round: {nbackRound} / 6
              </span>
            </div>

            {/* 3x3 Spatial Grid */}
            <div className="grid grid-cols-3 gap-3 w-64 h-64 mx-auto">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                const isLit = currentNbackTile === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl transition-all duration-200 border ${
                      isLit
                        ? 'bg-[#00A3FF] border-white scale-105 shadow-xl shadow-[#00A3FF]/50'
                        : 'bg-[#111111] border-[#222222]'
                    }`}
                  />
                );
              })}
            </div>

            <div className="text-xs text-[#888888]">{nbackFeedback}</div>

            {currentNbackTile !== null ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleNbackNext(true)}
                  className="py-3 rounded-xl bg-[#00FF85] text-black font-bold text-xs uppercase cursor-pointer"
                >
                  Match (Same as 2 back)
                </button>
                <button
                  onClick={() => handleNbackNext(false)}
                  className="py-3 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] text-white font-bold text-xs uppercase cursor-pointer"
                >
                  No Match (Different)
                </button>
              </div>
            ) : (
              <button
                id="start-dual-nback-btn"
                onClick={startDualNback}
                className="w-full py-3.5 rounded-xl bg-[#00A3FF] text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Start 2-Back Challenge
              </button>
            )}
          </div>
        )}

        {/* VIEW 3: Mindful Meditation */}
        {exerciseType === 'meditation' && (
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222222] rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#00A3FF]/10 border border-[#00A3FF]/30 flex items-center justify-center text-[#00A3FF] shadow-xl">
              <Smile className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-display text-white">Mindful Stillness</h2>
              <p className="text-xs text-[#888888]">
                Close your eyes, breathe naturally, and maintain calm presence.
              </p>
            </div>

            <div className="text-5xl font-mono font-black text-[#00A3FF] tracking-wider">
              {formatTimer(timerSeconds)}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                id="toggle-meditation-timer-btn"
                onClick={() => {
                  soundService.playMeditationBowl();
                  setIsTimerRunning(!isTimerRunning);
                }}
                className="py-3 px-6 rounded-xl bg-[#00A3FF] text-black font-bold text-sm shadow-lg shadow-[#00A3FF]/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                {isTimerRunning ? 'Pause Stillness' : 'Begin Meditation'}
              </button>

              <button
                id="test-finish-meditation-btn"
                onClick={() => handleCompleteMentalSession(activityDef.defaultTarget)}
                className="py-3 px-4 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] text-[#888888] hover:text-white border border-[#222222] text-xs font-semibold cursor-pointer"
              >
                Complete Now
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: Box Breathing */}
        {exerciseType === 'breathing' && (
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222222] rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-3xl border-4 transition-all duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'border-[#00FF85] scale-110 bg-[#00FF85]/10 shadow-xl shadow-[#00FF85]/20'
                    : breathPhase === 'Hold (Full)'
                    ? 'border-[#00A3FF] scale-110 bg-[#00A3FF]/10'
                    : breathPhase === 'Exhale'
                    ? 'border-[#FF9500] scale-85 bg-[#FF9500]/10'
                    : 'border-[#444444] scale-85 bg-[#111111]'
                }`}
              />
              <div className="text-center relative z-10">
                <div className="text-xs uppercase tracking-widest font-bold text-[#888888]">
                  {breathPhase}
                </div>
                <div className="text-4xl font-mono font-black text-white mt-1">
                  {breathCount}s
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display text-white">Box Breathing 4-4-4-4</h2>
              <p className="text-xs text-[#888888]">
                Navy SEAL nervous system regulation to regain instant mental clarity.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                id="toggle-breathing-btn"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="py-3 px-6 rounded-xl bg-[#00FF85] text-black font-bold text-sm shadow-lg shadow-[#00FF85]/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                {isTimerRunning ? 'Pause Pacing' : 'Start Box Breathing'}
              </button>

              <button
                id="complete-breathing-early-btn"
                onClick={() => handleCompleteMentalSession(5)}
                className="py-3 px-4 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] text-[#888888] hover:text-white border border-[#222222] text-xs font-semibold cursor-pointer"
              >
                Complete &amp; Claim
              </button>
            </div>
          </div>
        )}

        {/* VIEW 5: Pattern Memory Matrix */}
        {exerciseType === 'memory' && (
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#888888]">
                Round {memoryRound} of 5
              </span>
              <span className="text-xs text-[#00FF85] font-semibold">
                {isShowingSequence ? 'Memorize pattern...' : 'Your turn: repeat sequence'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 w-64 h-64 mx-auto">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                const isLit = activeHighlightTile === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTileClick(idx)}
                    disabled={isShowingSequence}
                    className={`rounded-2xl transition-all duration-200 cursor-pointer border ${
                      isLit
                        ? 'bg-[#00FF85] border-white scale-105 shadow-xl shadow-[#00FF85]/50'
                        : 'bg-[#111111] border-[#222222] hover:border-[#00FF85]/50 active:scale-95'
                    }`}
                  />
                );
              })}
            </div>

            {memorySequence.length === 0 ? (
              <button
                id="start-memory-game-btn"
                onClick={startMemoryGame}
                className="w-full py-3.5 rounded-xl bg-[#00FF85] text-black font-bold text-sm shadow-lg shadow-[#00FF85]/25 cursor-pointer"
              >
                Start Memory Challenge
              </button>
            ) : (
              <p className="text-xs text-[#888888]">
                Reach Round 5 to verify cognitive effort and earn screen time.
              </p>
            )}
          </div>
        )}

        {/* VIEW 6: Deep Reading Room */}
        {exerciseType === 'reading' && (
          <div className="w-full max-w-lg bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00A3FF]">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-white font-display">
                  Deep Reading Focus
                </span>
              </div>
              <div className="font-mono text-sm font-bold text-[#00A3FF]">
                {formatTimer(timerSeconds)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] text-xs text-[#CCCCCC] space-y-3 leading-relaxed">
              <p className="font-semibold text-white">
                « Excerpt: The Power of Deep Work by Cal Newport »
              </p>
              <p>
                Deep work is the ability to focus without distraction on a cognitively demanding task. It’s a skill that allows you to quickly master complicated information and produce better results in less time.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#CCCCCC]">
                Comprehension Verification Check:
              </div>
              <input
                type="text"
                placeholder="What skill does deep work develop?"
                value={quizAnswer1}
                onChange={(e) => setQuizAnswer1(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#222222] rounded-xl text-xs text-white focus:outline-none focus:border-[#00FF85]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                id="verify-reading-btn"
                onClick={() => handleCompleteMentalSession(15)}
                className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs tracking-wider uppercase border border-neutral-700 cursor-pointer"
              >
                Submit Text Quiz
              </button>

              <button
                id="verify-reading-ai-camera-btn"
                onClick={() => setIsCameraProofOpen(true)}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#00FF85] to-[#00A3FF] text-black font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#00FF85]/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Camera className="w-4 h-4" /> Snap AI Camera Proof
              </button>
            </div>
          </div>
        )}

        {/* VIEW 7: Sudoku Brain Training */}
        {exerciseType === 'sudoku' && (
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                Sudoku Solver
              </span>
              <span className="text-xs text-[#00FF85]">Fill missing numbers (1-9)</span>
            </div>

            <div className="grid grid-cols-9 gap-1 bg-[#111111] p-2 rounded-2xl border border-[#222222] mx-auto">
              {sudokuBoard.map((row, r) =>
                row.map((cell, c) => {
                  const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => setSelectedCell([r, c])}
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs rounded-md transition-colors ${
                        isSelected
                          ? 'bg-[#00FF85] text-black'
                          : cell > 0
                          ? 'bg-[#1a1a1a] text-white'
                          : 'bg-[#0A0A0A] text-[#666666] border border-[#222222] hover:border-[#00FF85]/50'
                      }`}
                    >
                      {cell > 0 ? cell : ''}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex justify-center gap-1.5 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleSudokuInput(num)}
                  className="w-8 h-9 rounded-lg bg-[#111111] hover:bg-[#1a1a1a] text-white font-bold text-xs flex items-center justify-center cursor-pointer transition-colors border border-[#222222]"
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              id="instant-solve-sudoku-btn"
              onClick={() => handleCompleteMentalSession(1)}
              className="w-full py-2.5 rounded-xl bg-[#00FF85] text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Verify &amp; Claim +5 min
            </button>
          </div>
        )}

        {/* Completion Modal Overlay */}
        {rewardResult && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#0A0A0A] border border-[#00FF85]/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-[#00FF85]/20 text-[#00FF85] border border-[#00FF85]/30 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-xl font-bold font-display text-white">
                  Mental Focus Verified!
                </h4>
                <p className="text-xs text-[#00FF85] mt-1">{rewardResult.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#111111] p-3 rounded-2xl border border-[#222222]">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#888888]">
                    Screen Time
                  </div>
                  <div className="text-lg font-bold font-display text-[#00FF85] font-mono">
                    +{rewardResult.rewardMinutes} min
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#888888]">XP Gained</div>
                  <div className="text-lg font-bold font-display text-[#00A3FF] font-mono">
                    +{rewardResult.xp} XP
                  </div>
                </div>
              </div>

              <button
                id="claim-mental-reward-btn"
                onClick={() => {
                  onRewardClaimed(rewardResult);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-[#00FF85] hover:bg-[#00e676] text-black font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#00FF85]/20 cursor-pointer"
              >
                Claim &amp; Return
              </button>
            </div>
          </div>
        )}

        {/* AI Camera Proof Modal */}
        <AICameraProofModal
          isOpen={isCameraProofOpen}
          onClose={() => setIsCameraProofOpen(false)}
          onRewardClaimed={(res) => {
            onRewardClaimed(res);
            onClose();
          }}
          initialHabitId={exerciseType === 'reading' ? 'reading_physical_book' : 'mindful_journaling'}
        />
      </div>
    </div>
  );
};
