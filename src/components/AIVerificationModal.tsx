import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  X,
  Zap,
  Activity,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { AIVerificationResult } from '../types';

interface AIVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AIVerificationResult | null;
  taskTitle: string;
  onConfirmClaim?: () => void;
}

export const AIVerificationModal: React.FC<AIVerificationModalProps> = ({
  isOpen,
  onClose,
  result,
  taskTitle,
  onConfirmClaim,
}) => {
  if (!isOpen || !result) return null;

  const isPass = result.verified && !result.isCheatingDetected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fade-in">
      <div className="apple-card w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/[0.1]">
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isPass
              ? 'bg-[#30D158]/5 border-[#30D158]/20'
              : 'bg-[#FF453A]/10 border-[#FF453A]/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
                isPass
                  ? 'bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]'
                  : 'bg-[#FF453A]/20 border-[#FF453A]/30 text-[#FF453A]'
              }`}
            >
              {isPass ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#86868B]">
                Gemini 3.7 Vision Telemetry
              </div>
              <div className="text-base font-semibold text-white tracking-tight">
                {isPass ? 'AI Task Verification Approved' : 'AI Verification Flagged'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#86868B] hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Badge Card */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isPass
                ? 'bg-white/[0.03] border-[#30D158]/30'
                : 'bg-[#FF453A]/5 border-[#FF453A]/30'
            }`}
          >
            <div className="space-y-1">
              <span
                className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold inline-block ${
                  isPass
                    ? 'bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30'
                    : 'bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30'
                }`}
              >
                {result.badge || (isPass ? 'Authentic Effort' : 'Unverified')}
              </span>
              <div className="text-lg font-semibold text-white tracking-tight">{taskTitle}</div>
              <div className="text-xs text-[#86868B] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#30D158]" />
                <span>Detected: {result.detectedActivity || taskTitle}</span>
              </div>
            </div>

            {isPass && (
              <div className="text-right flex flex-col items-end">
                <div className="text-2xl font-black text-[#30D158] font-mono flex items-center gap-1">
                  <Zap className="w-5 h-5 fill-[#30D158]" />
                  +{result.verifiedTokensAwarded}m
                </div>
                <div className="text-[10px] font-mono text-[#86868B]">+{result.xpEarned} XP Earned</div>
              </div>
            )}
          </div>

          {/* Scores Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center">
              <div className="text-[10px] text-[#86868B] font-mono uppercase">Authenticity</div>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  result.authenticityScore >= 80 ? 'text-[#30D158]' : 'text-[#FF9F0A]'
                }`}
              >
                {result.authenticityScore}%
              </div>
              <div className="text-[9px] text-[#86868B] mt-0.5">Human verified</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center">
              <div className="text-[10px] text-[#86868B] font-mono uppercase">Form & Posture</div>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  result.formScore >= 80 ? 'text-[#0A84FF]' : 'text-[#FF9F0A]'
                }`}
              >
                {result.formScore}%
              </div>
              <div className="text-[9px] text-[#86868B] mt-0.5">Biomechanical</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center">
              <div className="text-[10px] text-[#86868B] font-mono uppercase">Effort Rating</div>
              <div className="text-xl font-bold font-mono mt-1 capitalize text-[#BF5AF2]">
                {result.effortRating || 'High'}
              </div>
              <div className="text-[9px] text-[#86868B] mt-0.5">Intensity tier</div>
            </div>
          </div>

          {/* Captured Snapshots Preview */}
          {result.capturedImages && result.capturedImages.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#30D158]" /> Camera Snapshot Proofs
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {result.capturedImages.slice(0, 3).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden border border-white/[0.1] bg-black aspect-video group"
                  >
                    <img
                      src={img}
                      alt={`Proof frame ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-mono text-[#30D158]">
                      Frame {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Coach Feedback */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Sparkles className="w-4 h-4 text-[#0A84FF]" />
              <span>AI Coach Analysis</span>
            </div>
            <p className="text-xs text-[#E5E5EA] leading-relaxed">
              {result.coachFeedback}
            </p>
          </div>

          {/* Cheating Warning or Form Corrections */}
          {result.isCheatingDetected || !result.verified ? (
            <div className="p-4 rounded-2xl bg-[#FF453A]/10 border border-[#FF453A]/30 text-[#FF453A] text-xs space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#FF453A]" /> Non-Compliance Detected
              </div>
              <p className="text-white/80">{result.cheatingReason || 'The submitted proof did not demonstrate required movement or authentic human task engagement.'}</p>
            </div>
          ) : (
            result.formCorrections && result.formCorrections.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#30D158]" /> Coach Form Optimization Tips
                </div>
                <div className="space-y-1.5">
                  {result.formCorrections.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#E5E5EA] flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#30D158] shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-medium text-[#86868B] hover:text-white transition-colors cursor-pointer"
          >
            Close Report
          </button>
          {isPass && onConfirmClaim && (
            <button
              onClick={() => {
                onConfirmClaim();
                onClose();
              }}
              className="px-6 py-2.5 rounded-full bg-[#30D158] hover:bg-[#30D158]/90 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#30D158]/20 cursor-pointer transition-transform active:scale-95"
            >
              <Award className="w-4 h-4" /> Claim Verified Screen Time
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
