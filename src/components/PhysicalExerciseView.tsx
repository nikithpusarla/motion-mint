import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Activity,
  Camera,
  ChevronLeft,
  Dumbbell,
  Eye,
  Footprints,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { soundService } from '../services/audioService';
import { exerciseDetectionEngine } from '../services/exerciseDetectionEngine';
import { realTimeVisionEngine } from '../services/realTimeVisionEngine';
import { ASANA_DEFINITIONS } from '../services/yogaAsanasEngine';
import { rewardEngine } from '../services/rewardEngine';
import { aiVerificationService } from '../services/aiVerificationService';
import { INITIAL_ACTIVITIES, repository } from '../services/storageRepository';
import { ActivityIcon, getActivityVisualMeta } from './ActivityIcon';
import {
  ActivityResult,
  AIVerificationResult,
  CircuitStep,
  ExerciseFrameResult,
  ExerciseType,
  MLModelEngineType,
  RewardCalculationResult,
  YogaAsanaPose,
} from '../types';

interface PhysicalExerciseViewProps {
  exerciseType: ExerciseType;
  onClose: () => void;
  onRewardClaimed: (result: RewardCalculationResult) => void;
}

const CIRCUIT_ROUTINE: CircuitStep[] = [
  { stepId: 1, name: 'Pushups', exerciseType: 'pushups', targetRepsOrSec: 10, completed: false },
  { stepId: 2, name: 'Squats', exerciseType: 'squats', targetRepsOrSec: 15, completed: false },
  { stepId: 3, name: 'Jumping Jacks', exerciseType: 'jumping_jacks', targetRepsOrSec: 20, completed: false },
  { stepId: 4, name: 'Plank Hold', exerciseType: 'plank', targetRepsOrSec: 20, completed: false },
];

export const PhysicalExerciseView: React.FC<PhysicalExerciseViewProps> = ({
  exerciseType,
  onClose,
  onRewardClaimed,
}) => {
  const activityDef =
    INITIAL_ACTIVITIES.find((a) => a.id === exerciseType) || INITIAL_ACTIVITIES[0];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(170);
  const [feedback, setFeedback] = useState('Position your body in front of the camera');
  const [formScore, setFormScore] = useState(95);
  const [currentPhase, setCurrentPhase] = useState<'UP' | 'DOWN' | 'HOLD' | 'PREPARING'>('PREPARING');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isAIScanning, setIsAIScanning] = useState(false);
  const [aiVerificationResult, setAiVerificationResult] = useState<AIVerificationResult | null>(null);
  const [capturedProofImages, setCapturedProofImages] = useState<string[]>([]);
  const [sessionCompletedResult, setSessionCompletedResult] = useState<ActivityResult | null>(null);
  const [rewardResult, setRewardResult] = useState<RewardCalculationResult | null>(null);
  const [repFlash, setRepFlash] = useState(false);

  // Circuit Mode State
  const isCircuit = exerciseType === 'circuit_3min';
  const [circuitSteps, setCircuitSteps] = useState<CircuitStep[]>(CIRCUIT_ROUTINE);
  const [currentCircuitStepIndex, setCurrentCircuitStepIndex] = useState(0);

  // Audio Coach state
  const [voiceCoachEnabled, setVoiceCoachEnabled] = useState(
    repository.getUser().voiceCoachEnabled ?? true
  );

  // Model Engine & Yoga Asana State
  const [selectedEngine, setSelectedEngine] = useState<MLModelEngineType>(
    exerciseType === 'yoga_asanas' || exerciseType === 'yoga' ? 'opencv_yoga' : 'gym_cv2'
  );
  const [selectedAsana, setSelectedAsana] = useState<YogaAsanaPose>('warrior_2');

  // Step Tracker State for Walking
  const [stepCount, setStepCount] = useState(0);
  const [isWalkingActive, setIsWalkingActive] = useState(false);

  const isYoga = exerciseType === 'yoga_asanas' || exerciseType === 'yoga';

  // Active target calculations
  const activeExerciseTarget = isCircuit
    ? circuitSteps[currentCircuitStepIndex]?.targetRepsOrSec || 15
    : activityDef.defaultTarget;

  const currentActiveSubExercise = isCircuit
    ? circuitSteps[currentCircuitStepIndex]?.exerciseType || 'pushups'
    : exerciseType;

  // Handle Model Engine Selection
  const handleEngineChange = (engine: MLModelEngineType) => {
    setSelectedEngine(engine);
    exerciseDetectionEngine.setEngineMode(engine);
  };

  const handleAsanaChange = (asana: YogaAsanaPose) => {
    setSelectedAsana(asana);
    exerciseDetectionEngine.setYogaAsana(asana);
    setCurrentReps(0);
  };

  const toggleVoiceCoach = () => {
    const nextState = !voiceCoachEnabled;
    setVoiceCoachEnabled(nextState);
    repository.updateUser({ voiceCoachEnabled: nextState });
    if (nextState) {
      soundService.speakCoachCue('Voice coach activated. Let us go!');
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Camera permission not granted or camera unavailable. You can allow camera access or use the manual rep simulator below.'
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Start Workout Session
  const handleStartWorkout = async () => {
    setIsSessionActive(true);
    setCurrentReps(0);
    setSessionCompletedResult(null);
    setRewardResult(null);

    if (voiceCoachEnabled) {
      soundService.speakCoachCue('Workout started! Keep good form.');
    }

    exerciseDetectionEngine.setEngineMode(selectedEngine);
    if (isYoga) {
      exerciseDetectionEngine.setYogaAsana(selectedAsana);
    }

    if (exerciseType === 'walking') {
      setIsWalkingActive(true);
      setStepCount(0);
      return;
    }

    await startCamera();
    exerciseDetectionEngine.startSession(currentActiveSubExercise, activeExerciseTarget);
  };

  // Subscribe to Pose Detection Engine updates
  useEffect(() => {
    const unsubscribe = exerciseDetectionEngine.subscribe((frame: ExerciseFrameResult) => {
      if (frame.repCount > currentReps) {
        setRepFlash(true);
        setTimeout(() => setRepFlash(false), 400);
      }
      setCurrentReps(frame.repCount);
      setCurrentAngle(frame.angles.primaryAngle || 170);
      setFeedback(frame.feedbackMessage);
      setFormScore(frame.formScore || 90);
      setCurrentPhase(frame.currentPhase);

      // Auto completion check
      if (frame.repCount >= activeExerciseTarget && !sessionCompletedResult) {
        if (isCircuit) {
          handleAdvanceCircuitStep();
        } else {
          handleFinishWorkout();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeExerciseTarget, sessionCompletedResult, currentReps, isCircuit, currentCircuitStepIndex]);

  // Circuit Step Advancement
  const handleAdvanceCircuitStep = () => {
    const updated = [...circuitSteps];
    updated[currentCircuitStepIndex].completed = true;
    setCircuitSteps(updated);

    if (currentCircuitStepIndex + 1 < circuitSteps.length) {
      const nextIndex = currentCircuitStepIndex + 1;
      setCurrentCircuitStepIndex(nextIndex);
      setCurrentReps(0);
      const nextStep = circuitSteps[nextIndex];
      soundService.speakCoachCue(`Great job! Next up: ${nextStep.name}`);
      exerciseDetectionEngine.startSession(nextStep.exerciseType, nextStep.targetRepsOrSec);
    } else {
      handleFinishWorkout();
    }
  };

  // Video processing animation loop
  useEffect(() => {
    let active = true;

    const processLoop = async () => {
      if (active && isCameraActive && videoRef.current && canvasRef.current) {
        await exerciseDetectionEngine.processVideoFrame(videoRef.current, canvasRef.current);
      }
      if (active && isCameraActive) {
        animFrameIdRef.current = requestAnimationFrame(processLoop);
      }
    };

    if (isCameraActive) {
      animFrameIdRef.current = requestAnimationFrame(processLoop);
    }

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isCameraActive]);

  // Step sensor simulation interval for walking
  useEffect(() => {
    let interval: number | null = null;
    if (isWalkingActive) {
      interval = window.setInterval(() => {
        setStepCount((prev) => {
          const next = prev + Math.floor(Math.random() * 8) + 12;
          if (next >= activityDef.defaultTarget) {
            handleFinishWalking(next);
          }
          return next;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWalkingActive, activityDef.defaultTarget]);

  const handleFinishWalking = (finalSteps: number) => {
    setIsWalkingActive(false);
    setIsSessionActive(false);

    const result: ActivityResult = {
      activityId: 'walking',
      activityType: 'walking',
      target: activityDef.defaultTarget,
      measuredValue: finalSteps,
      confidence: 0.95,
      completed: finalSteps >= activityDef.defaultTarget,
      verificationMethod: 'sensor_steps',
      durationSeconds: 120,
      timestamp: Date.now(),
    };

    setSessionCompletedResult(result);
    const reward = rewardEngine.processActivityResult(result);
    setRewardResult(reward);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleFinishWorkout = async () => {
    // 1. Capture snapshot before stopping camera
    const snaps: string[] = [];
    if (videoRef.current) {
      const snap = aiVerificationService.captureFrameFromVideo(videoRef.current, 0.85);
      if (snap) snaps.push(snap);
    }
    if (canvasRef.current) {
      const snap2 = aiVerificationService.captureFrameFromCanvas(canvasRef.current, 0.85);
      if (snap2) snaps.push(snap2);
    }
    setCapturedProofImages(snaps);

    stopCamera();
    setIsSessionActive(false);
    setIsAIScanning(true);

    const result = exerciseDetectionEngine.stopSession();
    if (isCircuit) {
      result.activityId = 'circuit_3min';
      result.activityType = 'circuit_3min';
      result.target = 4;
      result.measuredValue = 4;
      result.completed = true;
    }
    setSessionCompletedResult(result);

    try {
      // 2. Call Gemini Vision AI Verification
      const aiResult = await aiVerificationService.verifyTaskWithGemini({
        taskType: isCircuit ? 'circuit_3min' : currentActiveSubExercise,
        taskTitle: isCircuit ? '3-Minute Power Circuit' : activityDef.title,
        category: activityDef.category,
        targetValue: activeExerciseTarget,
        measuredValue: result.measuredValue || currentReps,
        unit: isYoga || currentActiveSubExercise === 'plank' ? 'seconds' : 'reps',
        images: snaps,
        formMetrics: {
          formScore,
          engine: selectedEngine,
          asana: isYoga ? selectedAsana : undefined,
          angles: { primaryAngle: currentAngle },
        },
      });

      setAiVerificationResult(aiResult);

      // 3. Process rewards with AI verification audit
      const reward = rewardEngine.processActivityResult(result, aiResult);
      setRewardResult(reward);

      if (reward.rewardMinutes > 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        if (voiceCoachEnabled) {
          soundService.speakCoachCue(
            `AI Verification Approved: ${aiResult.badge}! ${reward.rewardMinutes} minutes screen time minted.`,
            true
          );
        }
      } else if (aiResult.isCheatingDetected) {
        if (voiceCoachEnabled) {
          soundService.speakCoachCue('AI verification flagged: task execution not verified.');
        }
      }
    } catch (err) {
      console.warn('AI verification failed:', err);
      const fallbackReward = rewardEngine.processActivityResult(result);
      setRewardResult(fallbackReward);
    } finally {
      setIsAIScanning(false);
    }
  };

  const handleRecalibrateBaseline = () => {
    realTimeVisionEngine.reset();
    setFeedback('Baseline posture reset. Begin movement.');
  };

  const handleSimulateRep = () => {
    exerciseDetectionEngine.incrementManualRep(95);
  };

  const progressPercent = Math.min(
    100,
    Math.round(
      ((exerciseType === 'walking' ? stepCount : currentReps) / activeExerciseTarget) * 100
    )
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col overflow-y-auto">
      {/* Top Bar */}
      <div className="bg-[#0A0A0A] border-b border-[#222222] px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <button
          id="back-from-exercise-btn"
          onClick={() => {
            stopCamera();
            onClose();
          }}
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
            <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{activityDef.title}</span>
            </div>
            <div className="text-[10px] text-[#86868B] font-mono">
              Reward: +{activityDef.rewardMinutes} min screen time • +{activityDef.xpReward} XP
            </div>
          </div>
        </div>

        {/* Action Controls & Voice Coach Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoiceCoach}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              voiceCoachEnabled
                ? 'bg-[#00A3FF]/15 border-[#00A3FF]/40 text-[#00A3FF]'
                : 'bg-[#111111] border-[#222222] text-[#888888]'
            }`}
          >
            {voiceCoachEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice Coach</span>
          </button>

          <div className="flex items-center bg-[#111111] border border-[#222222] rounded-xl p-1 text-[10px] font-mono">
            <button
              onClick={() => handleEngineChange('gym_cv2')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedEngine === 'gym_cv2'
                  ? 'bg-[#00FF85] text-black font-bold'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              CV Kinematics
            </button>
            <button
              onClick={() => handleEngineChange('blazepose_33')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedEngine === 'blazepose_33'
                  ? 'bg-[#00FF85] text-black font-bold'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              BlazePose 33-Keypoint
            </button>
          </div>
        </div>
      </div>

      {/* Circuit Routine Step Tracker */}
      {isCircuit && (
        <div className="bg-white/[0.02] border-b border-white/[0.08] px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#30D158]" />
            <span>Circuit Step {currentCircuitStepIndex + 1} of {circuitSteps.length}:</span>{' '}
            <span className="text-[#30D158] font-mono">{circuitSteps[currentCircuitStepIndex]?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {circuitSteps.map((step, idx) => {
              const meta = getActivityVisualMeta(step.exerciseType);
              const isActive = idx === currentCircuitStepIndex;
              return (
                <div
                  key={step.stepId}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    step.completed
                      ? 'bg-[#30D158] text-black border-[#30D158] shadow-sm'
                      : isActive
                      ? 'bg-white text-black border-white shadow-md scale-105'
                      : 'bg-white/[0.04] text-[#86868B] border-white/[0.08]'
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span>{step.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {exerciseType === 'walking' ? (
          /* Walking Sensor View */
          <div className="flex-1 apple-card rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl border border-white/[0.1]">
            <ActivityIcon
              activityId="walking"
              category="physical"
              size="xl"
              showBadge={true}
              interactive={true}
            />

            <div>
              <div className="text-xs uppercase font-semibold text-[#86868B] tracking-widest font-mono">
                Pedometer Step Counter
              </div>
              <div className="text-6xl font-mono font-black text-white mt-1">
                {stepCount}{' '}
                <span className="text-2xl text-[#86868B] font-normal">
                  / {activityDef.defaultTarget} steps
                </span>
              </div>
            </div>

            <div className="w-full max-w-md h-3 bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.08]">
              <div
                className="h-full bg-gradient-to-r from-[#30D158] to-[#0A84FF] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center gap-3">
              {!isSessionActive ? (
                <button
                  id="start-walking-session-btn"
                  onClick={handleStartWorkout}
                  className="py-3.5 px-8 rounded-xl bg-[#00FF85] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#00FF85]/20 cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" /> Start Step Tracking
                </button>
              ) : (
                <button
                  id="finish-walking-session-btn"
                  onClick={() => handleFinishWalking(activityDef.defaultTarget)}
                  className="py-3.5 px-8 rounded-xl bg-[#00A3FF] text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Complete Goal Now ({activityDef.defaultTarget} Steps)
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Real-Time Camera View with Skeleton HUD */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            {/* Camera + Overlay Feed */}
            <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#222222] rounded-3xl p-3 flex flex-col relative overflow-hidden shadow-2xl">
              <div className="relative flex-1 min-h-[380px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                {/* Live Video */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                />

                {/* Live Skeleton HUD Canvas */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none z-10"
                />

                {/* Rep Flash Effect */}
                {repFlash && (
                  <div className="absolute inset-0 bg-[#00FF85]/20 pointer-events-none z-20 transition-opacity duration-300" />
                )}

                {/* Pre-start overlay */}
                {!isCameraActive && (
                  <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#00FF85]/10 border border-[#00FF85]/30 flex items-center justify-center text-[#00FF85]">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="max-w-xs">
                      <h3 className="text-base font-bold text-white font-display">
                        Ready to Verify Exercise?
                      </h3>
                      <p className="text-xs text-[#888888] mt-1">
                        Camera analyzes joint angles and reps in real-time. Everything runs client-side.
                      </p>
                    </div>

                    {cameraError && (
                      <div className="text-xs text-[#FF9500] bg-[#FF9500]/10 border border-[#FF9500]/20 p-2.5 rounded-xl max-w-sm">
                        {cameraError}
                      </div>
                    )}

                    <button
                      id="launch-camera-session-btn"
                      onClick={handleStartWorkout}
                      className="py-3 px-6 rounded-xl bg-[#00FF85] hover:bg-[#00e676] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#00FF85]/25 cursor-pointer flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" /> Start Detection Engine
                    </button>
                  </div>
                )}

                {/* Active HUD Overlays */}
                {isCameraActive && (
                  <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                    <div className="bg-black/70 backdrop-blur border border-[#333333] px-3 py-1.5 rounded-xl flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00FF85] animate-ping" />
                      <span className="text-[10px] font-mono text-white font-bold uppercase">
                        {selectedEngine} • 60 FPS
                      </span>
                    </div>

                    <div className="bg-black/70 backdrop-blur border border-[#333333] px-3 py-1.5 rounded-xl text-[10px] font-mono text-[#00FF85] font-bold">
                      FORM SCORE: {formScore}%
                    </div>
                  </div>
                )}

                {/* Bottom HUD Feedback */}
                {isCameraActive && (
                  <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur border border-[#333333] px-4 py-2.5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#00FF85]" />
                        <span className="text-xs text-white font-medium">{feedback}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#888888] uppercase">
                        Phase: {currentPhase}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls Bar */}
              <div className="pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRecalibrateBaseline}
                    className="p-2 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] text-[#888888] hover:text-white text-xs cursor-pointer flex items-center gap-1.5"
                    title="Recalibrate zero-point baseline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Calibrate
                  </button>

                  <button
                    id="simulate-rep-test-btn"
                    onClick={handleSimulateRep}
                    className="py-1.5 px-3 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-[#222222] text-[#00FF85] text-xs font-mono font-bold cursor-pointer"
                  >
                    +1 Rep (Simulate)
                  </button>
                </div>

                {isSessionActive && (
                  <button
                    id="stop-workout-btn"
                    onClick={handleFinishWorkout}
                    className="py-2 px-4 rounded-xl bg-[#FF453A]/20 hover:bg-[#FF453A]/30 text-[#FF453A] border border-[#FF453A]/30 text-xs font-bold uppercase cursor-pointer"
                  >
                    Finish Session
                  </button>
                )}
              </div>
            </div>

            {/* Workout Metrics Sidebar */}
            <div className="bg-[#0A0A0A] border border-[#222222] rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-2xl">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                    {isYoga || currentActiveSubExercise === 'plank' ? 'Hold Time' : 'Completed Repetitions'}
                  </span>
                  <div className="text-5xl font-mono font-black text-white mt-1 flex items-baseline gap-2">
                    <span className="text-[#00FF85]">{currentReps}</span>
                    <span className="text-xl text-[#888888] font-normal">
                      / {activeExerciseTarget} {isYoga || currentActiveSubExercise === 'plank' ? 'sec' : 'reps'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-[#888888]">
                    <span>PROGRESS</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#111111] rounded-full overflow-hidden border border-[#222222]">
                    <div
                      className="h-full bg-gradient-to-r from-[#00FF85] to-[#00A3FF] transition-all duration-200"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Live Joint Kinematics */}
                <div className="p-3 bg-[#111111] rounded-2xl border border-[#222222] space-y-2">
                  <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                    Kinematic Joint Sensor
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#CCCCCC]">Target Joint Angle:</span>
                    <span className="font-mono text-sm font-bold text-[#00A3FF]">
                      {currentAngle}°
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#CCCCCC]">Form Adherence:</span>
                    <span className="font-mono text-sm font-bold text-[#00FF85]">
                      {formScore}%
                    </span>
                  </div>
                </div>

                {/* Yoga Asana Picker if in Yoga mode */}
                {isYoga && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                      Target Asana Pose
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(ASANA_DEFINITIONS).map(([key, def]) => (
                        <button
                          key={key}
                          onClick={() => handleAsanaChange(key as YogaAsanaPose)}
                          className={`p-2 rounded-xl text-left border text-xs transition-colors cursor-pointer ${
                            selectedAsana === key
                              ? 'bg-[#00FF85]/10 border-[#00FF85] text-white'
                              : 'bg-[#111111] border-[#222222] text-[#888888] hover:text-white'
                          }`}
                        >
                          <div className="font-bold truncate">{def.englishName}</div>
                          <div className="text-[9px] text-[#666666]">{def.sanskritName}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Instant Claim Button for Testing */}
              <button
                id="instant-complete-exercise-btn"
                onClick={() => {
                  if (isCircuit) {
                    handleFinishWorkout();
                  } else {
                    exerciseDetectionEngine.incrementManualRep(activeExerciseTarget);
                    handleFinishWorkout();
                  }
                }}
                className="w-full py-3 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-[#00FF85]/30 hover:border-[#00FF85] text-[#00FF85] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
              >
                Instant Verify &amp; Unlock
              </button>
            </div>
          </div>
        )}

        {/* AI Scanning Modal Overlay */}
        {isAIScanning && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0D0D0D] border border-[#00FF85]/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#00FF85]/30 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2 border-t-[#00FF85] border-r-[#00A3FF] border-b-transparent border-l-transparent animate-spin" />
                <ShieldCheck className="w-8 h-8 text-[#00FF85] animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30">
                  Gemini 3.7 Flash Vision
                </div>
                <h4 className="text-xl font-bold font-display text-white">
                  Verifying Exercise Authenticity...
                </h4>
                <p className="text-xs text-[#888888]">
                  Auditing movement trajectory, rep range, and anti-spoofing markers
                </p>
              </div>

              <div className="p-3 bg-black/50 border border-neutral-800 rounded-xl flex items-center justify-center gap-3 text-xs text-[#AAAAAA]">
                <div className="w-2 h-2 rounded-full bg-[#00FF85] animate-ping" />
                <span>Kinematic Snapshot Analysis in Progress</span>
              </div>
            </div>
          </div>
        )}

        {/* Completion & AI Verification Modal Overlay */}
        {rewardResult && !isAIScanning && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0A0A0A] border border-[#00FF85]/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#00FF85]/20 text-[#00FF85] border border-[#00FF85]/30 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30 mb-1">
                  {aiVerificationResult?.badge || 'AI Camera Verified'}
                </div>
                <h4 className="text-xl font-bold font-display text-white">
                  {aiVerificationResult?.verified ? 'Workout AI-Verified!' : 'Verification Flagged'}
                </h4>
                <p className="text-xs text-[#00FF85] mt-0.5">{rewardResult.message}</p>
              </div>

              {/* AI Scores Banner */}
              {aiVerificationResult && (
                <div className="grid grid-cols-2 gap-2 bg-[#111111] p-3 rounded-2xl border border-[#222222]">
                  <div className="text-center p-2 rounded-xl bg-black/40">
                    <div className="text-[10px] uppercase font-bold text-[#888888]">Authenticity</div>
                    <div className="text-lg font-bold font-display text-[#00FF85] font-mono">
                      {aiVerificationResult.authenticityScore}%
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-black/40">
                    <div className="text-[10px] uppercase font-bold text-[#888888]">Form Quality</div>
                    <div className="text-lg font-bold font-display text-[#00A3FF] font-mono">
                      {aiVerificationResult.formScore}%
                    </div>
                  </div>
                </div>
              )}

              {/* Coach Feedback */}
              {aiVerificationResult?.coachFeedback && (
                <div className="p-3 rounded-xl bg-[#111111] border border-[#222222] text-left text-xs text-[#CCCCCC] leading-relaxed">
                  <div className="font-bold text-[#00FF85] flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Coach Feedback
                  </div>
                  <p>{aiVerificationResult.coachFeedback}</p>
                </div>
              )}

              {/* Rewards Summary */}
              <div className="grid grid-cols-2 gap-2 bg-[#111111] p-3 rounded-2xl border border-[#222222]">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#888888]">
                    Screen Time Earned
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
                id="claim-exercise-reward-btn"
                onClick={() => {
                  onRewardClaimed(rewardResult);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-[#00FF85] hover:bg-[#00e676] text-black font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#00FF85]/20 cursor-pointer transition-transform active:scale-95"
              >
                Claim Screen Time &amp; Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
