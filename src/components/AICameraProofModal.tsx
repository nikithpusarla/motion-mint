import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Camera,
  ChevronLeft,
  Upload,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BookOpen,
  Edit3,
  Footprints,
  Droplets,
  HelpCircle,
  Eye,
  FileText,
  Clock,
} from 'lucide-react';
import { AI_PROOF_HABITS, aiVerificationService } from '../services/aiVerificationService';
import { rewardEngine } from '../services/rewardEngine';
import { AIProofHabit, AIVerificationResult, RewardCalculationResult } from '../types';
import { ActivityIcon, getActivityVisualMeta } from './ActivityIcon';

interface AICameraProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (result: RewardCalculationResult) => void;
  initialHabitId?: string;
}

export const AICameraProofModal: React.FC<AICameraProofModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
  initialHabitId,
}) => {
  const [selectedHabit, setSelectedHabit] = useState<AIProofHabit>(
    AI_PROOF_HABITS.find((h) => h.id === initialHabitId) || AI_PROOF_HABITS[0]
  );

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState<AIVerificationResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialHabitId) {
      const match = AI_PROOF_HABITS.find((h) => h.id === initialHabitId);
      if (match) setSelectedHabit(match);
    }
  }, [initialHabitId]);

  // Start Camera Stream
  const startCamera = async (facing: 'user' | 'environment' = facingMode) => {
    try {
      setCameraError(null);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera stream error in proof modal:', err);
      setCameraError('Camera access denied or device unavailable. You can upload a photo proof below.');
      setIsCameraActive(false);
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

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
      setCapturedImage(null);
      setVerificationResult(null);
      setUserNotes('');
      setIsScanning(false);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture current video frame
  const handleSnapProof = () => {
    if (!videoRef.current) return;
    const snap = aiVerificationService.captureFrameFromVideo(videoRef.current, 0.9);
    if (snap) {
      setCapturedImage(snap);
      stopCamera();
    }
  };

  // Upload photo proof manually
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCapturedImage(event.target.result);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    startCamera(facingMode);
  };

  // Trigger Gemini 3.7 Flash AI Multimodal verification
  const handleVerifyWithGemini = async () => {
    if (!capturedImage) return;

    setIsScanning(true);
    setVerificationResult(null);

    try {
      const result = await aiVerificationService.verifyTaskWithGemini({
        taskType: selectedHabit.id,
        taskTitle: selectedHabit.title,
        category: 'habit_proof',
        targetValue: selectedHabit.targetCount,
        measuredValue: selectedHabit.targetCount,
        unit: selectedHabit.unit,
        images: [capturedImage],
        userNotes: userNotes.trim() || undefined,
        formMetrics: {
          proofCategory: selectedHabit.category,
          tokenTier: selectedHabit.tokenReward,
        },
      });

      setVerificationResult(result);

      if (result.verified && !result.isCheatingDetected) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Error during AI proof verification:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Claim verified rewards
  const handleClaimReward = () => {
    if (!verificationResult || !verificationResult.verified) return;

    const rewardRes = rewardEngine.processAIVerifiedHabit(
      selectedHabit.title,
      selectedHabit.id,
      verificationResult
    );

    onRewardClaimed(rewardRes);
    onClose();
  };

  if (!isOpen) return null;

  const getHabitIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'Edit3':
        return <Edit3 className="w-4 h-4" />;
      case 'Footprints':
        return <Footprints className="w-4 h-4" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl overflow-y-auto animate-fade-in">
      <div className="apple-card w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh] border border-white/[0.1]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white flex items-center justify-center border border-white/[0.08] transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white tracking-tight">AI Camera Proof Verification</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/30">
                  Gemini Vision 3.7
                </span>
              </div>
              <div className="text-[11px] text-[#86868B] tracking-tight mt-0.5">
                Authenticate offline deep work and healthy habits before minting screen time
              </div>
            </div>
          </div>
        </div>

        {/* Habit Selector Chips */}
        <div className="p-3 bg-white/[0.01] border-b border-white/[0.08] overflow-x-auto flex items-center gap-2.5 no-scrollbar">
          {AI_PROOF_HABITS.map((habit) => {
            const isSelected = selectedHabit.id === habit.id;
            const meta = getActivityVisualMeta(habit.id, habit.icon, 'habit');
            return (
              <button
                key={habit.id}
                onClick={() => {
                  setSelectedHabit(habit);
                  setCapturedImage(null);
                  setVerificationResult(null);
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer border group ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-md font-bold scale-[1.02]'
                    : 'bg-white/[0.04] text-[#86868B] border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <ActivityIcon
                  activityId={habit.id}
                  iconName={habit.icon}
                  category="habit"
                  size="sm"
                  showBadge={true}
                  interactive={false}
                />
                <span className="font-semibold">{habit.title}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? 'bg-black/10 text-black'
                      : 'bg-white/[0.06] text-[#30D158]'
                  }`}
                >
                  +{habit.tokenReward}m
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Viewport */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Active Habit Instructions Banner */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3.5">
            <ActivityIcon
              activityId={selectedHabit.id}
              iconName={selectedHabit.icon}
              category="habit"
              size="lg"
              showBadge={true}
              interactive={true}
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                  <span>{selectedHabit.title}</span>
                </span>
                <span className="text-xs font-bold text-[#30D158] font-mono bg-[#30D158]/10 px-2.5 py-0.5 rounded-full border border-[#30D158]/30">
                  +{selectedHabit.tokenReward} min unlock
                </span>
              </div>
              <p className="text-xs text-[#86868B] leading-relaxed">{selectedHabit.promptInstructions}</p>
              <div className="text-[10px] text-[#86868B] flex items-center gap-1 font-mono pt-1">
                <span>Example proof: {selectedHabit.exampleProof}</span>
              </div>
            </div>
          </div>

          {/* Camera / Capture Frame */}
          <div className="relative rounded-3xl overflow-hidden bg-black border border-white/[0.1] aspect-video flex items-center justify-center shadow-inner">
            {/* Live Video Feed */}
            {!capturedImage && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Captured Snapshot View */}
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured Proof"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Camera Error Message */}
            {!capturedImage && cameraError && (
              <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-[#FF9F0A]" />
                <p className="text-xs text-[#86868B] max-w-sm">{cameraError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-full bg-[#30D158] text-black font-semibold text-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                >
                  <Upload className="w-4 h-4" /> Upload Photo Proof
                </button>
              </div>
            )}

            {/* Live Camera Overlay Reticle */}
            {!capturedImage && isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                <div className="flex justify-between items-center">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.15] flex items-center gap-2 text-[10px] font-mono text-[#30D158]">
                    <span className="w-2 h-2 rounded-full bg-[#30D158] animate-ping" />
                    LIVE SENSOR READY
                  </div>
                  <button
                    onClick={toggleFacingMode}
                    className="pointer-events-auto w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/[0.15] flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    title="Flip camera"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Target Alignment Corners */}
                <div className="self-center w-52 h-40 border-2 border-dashed border-[#30D158]/50 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                  <span className="text-[10px] font-mono text-[#30D158] bg-black/70 px-2.5 py-1 rounded-full border border-[#30D158]/30">
                    Align Subject Frame
                  </span>
                </div>

                <div className="text-center text-[10px] text-[#86868B] bg-black/60 backdrop-blur-md py-1 px-3 rounded-full self-center border border-white/[0.08]">
                  Keep document or activity clearly illuminated
                </div>
              </div>
            )}

            {/* AI Scanning Active Animation */}
            {isScanning && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-[#30D158]/30 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-[#30D158] border-r-[#0A84FF] border-b-transparent border-l-transparent animate-spin" />
                  <Sparkles className="w-6 h-6 text-[#30D158] animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm font-semibold text-white tracking-tight">Gemini Vision AI Inspecting Proof...</div>
                  <div className="text-xs text-[#86868B]">
                    Validating authenticity, checking anti-spoofing markers & verifying task metrics
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Capture & Upload Action Bar */}
          {!capturedImage ? (
            <div className="flex items-center justify-center gap-4 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-white border border-white/[0.1] flex items-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#86868B]" /> Upload Photo
              </button>

              <button
                onClick={handleSnapProof}
                disabled={!isCameraActive}
                className={`px-8 py-3 rounded-full font-semibold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer ${
                  isCameraActive
                    ? 'bg-[#30D158] hover:bg-[#30D158]/90 text-black shadow-[#30D158]/20'
                    : 'bg-white/[0.04] text-[#86868B] border border-white/[0.08] cursor-not-allowed'
                }`}
              >
                <Camera className="w-4 h-4" /> Take Proof Snapshot
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Optional User Notes */}
              <div>
                <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-1.5">
                  Optional Reflection / Context Notes
                </label>
                <input
                  type="text"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g., Chapter 4 finished, 15 pages read, outdoor 20-min session..."
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#86868B] focus:outline-none focus:border-[#30D158] transition-colors"
                />
              </div>

              {/* Action Buttons */}
              {!verificationResult && (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={handleRetake}
                    className="px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-white border border-white/[0.1] flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#86868B]" /> Retake Photo
                  </button>

                  <button
                    onClick={handleVerifyWithGemini}
                    disabled={isScanning}
                    className="px-6 py-2.5 rounded-full bg-[#30D158] hover:bg-[#30D158]/90 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#30D158]/20 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-black" /> Run Gemini AI Verification
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Verification Result Inspection Card */}
          {verificationResult && (
            <div
              className={`p-4 rounded-2xl border space-y-3 animate-fade-in ${
                verificationResult.verified && !verificationResult.isCheatingDetected
                  ? 'bg-[#30D158]/5 border-[#30D158]/30'
                  : 'bg-[#FF453A]/10 border-[#FF453A]/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${
                      verificationResult.verified
                        ? 'bg-[#30D158]/15 border-[#30D158]/40 text-[#30D158]'
                        : 'bg-[#FF453A]/20 border-[#FF453A]/30 text-[#FF453A]'
                    }`}
                  >
                    {verificationResult.verified ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white tracking-tight">
                      {verificationResult.verified ? 'AI Verification Passed' : 'Verification Flagged'}
                    </div>
                    <div className="text-xs text-[#86868B] mt-0.5">
                      {verificationResult.detectedActivity || selectedHabit.title} • Authenticity:{' '}
                      <span className="font-bold text-[#30D158] font-mono">{verificationResult.authenticityScore}%</span>
                    </div>
                  </div>
                </div>

                {verificationResult.verified && (
                  <div className="text-right">
                    <div className="text-xl font-black text-[#30D158] font-mono flex items-center justify-end gap-1">
                      <Zap className="w-4 h-4 fill-[#30D158]" />
                      +{verificationResult.verifiedTokensAwarded} min
                    </div>
                    <div className="text-[10px] font-mono text-[#86868B]">+{verificationResult.xpEarned} XP</div>
                  </div>
                )}
              </div>

              {/* Coach Feedback */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#E5E5EA] leading-relaxed">
                <span className="font-semibold text-[#30D158] mr-1.5">AI Referee:</span>
                {verificationResult.coachFeedback}
              </div>

              {/* Cheating or Form tips */}
              {verificationResult.isCheatingDetected ? (
                <div className="text-xs text-[#FF453A] p-2.5 rounded-xl bg-[#FF453A]/10 border border-[#FF453A]/20">
                  <span className="font-semibold">Flagged Reason: </span>
                  {verificationResult.cheatingReason}
                </div>
              ) : (
                verificationResult.formCorrections && verificationResult.formCorrections.length > 0 ? (
                  <div className="text-[11px] text-[#86868B] space-y-1.5">
                    {verificationResult.formCorrections.map((tip, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                ) : null
              )}

              {/* Final Claim or Retake */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#86868B] hover:text-white transition-colors cursor-pointer"
                >
                  Try Another Photo
                </button>
                {verificationResult.verified && !verificationResult.isCheatingDetected && (
                  <button
                    onClick={handleClaimReward}
                    className="px-6 py-2.5 rounded-full bg-[#30D158] hover:bg-[#30D158]/90 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#30D158]/20 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-black" /> Claim &amp; Mint Screen Time
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
