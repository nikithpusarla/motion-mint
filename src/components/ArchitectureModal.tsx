import React, { useState } from 'react';
import {
  BookOpen,
  Boxes,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  GitBranch,
  Layers,
  Lock,
  Shield,
  Sparkles,
  Zap,
  X,
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'open_source_ml' | 'ai_vision_guardian' | 'clean_arch' | 'room_db' | 'app_blocker' | 'ml_adapter'
  >('ai_vision_guardian');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/30">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Android Architecture &amp; Gemini AI Task Verification
              </h2>
              <p className="text-xs text-[#888888]">
                Gemini 3.7 Flash Multimodal • MediaPipe ML • Kotlin MVVM • Accessibility Service Blocker
              </p>
            </div>
          </div>
          <button
            id="close-arch-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full bg-[#111111] text-[#888888] hover:text-white border border-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-[#222222] pb-2 overflow-x-auto">
          {[
            { id: 'ai_vision_guardian', label: '🛡️ Gemini AI Anti-Cheat Verification', icon: Sparkles },
            { id: 'open_source_ml', label: 'Integrated Open-Source ML', icon: GitBranch },
            { id: 'clean_arch', label: 'MVVM & Clean Architecture', icon: Layers },
            { id: 'room_db', label: 'Room SQLite Schema', icon: Database },
            { id: 'app_blocker', label: 'Android Blocker Mechanism', icon: Lock },
            { id: 'ml_adapter', label: 'Pluggable ML Interface', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  isSel
                    ? 'bg-[#00FF85] border-[#00FF85] text-black font-bold shadow'
                    : 'bg-[#111111] border-[#222222] text-[#888888] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-[#CCCCCC] font-mono leading-relaxed">
          {/* TAB: GEMINI AI VISION ANTI-CHEAT GUARDIAN */}
          {activeTab === 'ai_vision_guardian' && (
            <div className="space-y-6 font-sans">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00FF85]/10 via-[#00A3FF]/10 to-transparent border border-[#00FF85]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#00FF85] bg-[#00FF85]/20 px-2.5 py-1 rounded-lg border border-[#00FF85]/40 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5" /> Rewired-Style AI Proof Protocol
                  </span>
                  <span className="text-[11px] text-[#00A3FF] font-mono">Gemini 3.7 Flash Multimodal</span>
                </div>
                <p className="text-xs text-[#CCCCCC] leading-relaxed">
                  Motion Mint replaces passive honor systems with an AI-verified smart contract. Every physical repetition stream or offline habit photo is audited by Gemini Vision against biometric integrity checks, detecting spoofing, screen re-recordings, static loops, or poor form before crediting screen-time tokens.
                </p>
              </div>

              {/* 3 Pillars of AI Verification */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] space-y-2">
                  <div className="text-[10px] font-mono font-bold text-[#00FF85] uppercase">
                    1. Real-Time Pose Keyframes
                  </div>
                  <h4 className="text-sm font-bold text-white">Motion Trajectory Audit</h4>
                  <p className="text-[11px] text-[#888888] leading-relaxed">
                    Client camera captures start, inflection (bottom/top), and completion snapshots alongside timestamp deltas.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] space-y-2">
                  <div className="text-[10px] font-mono font-bold text-[#00A3FF] uppercase">
                    2. Anti-Cheat Heuristics
                  </div>
                  <h4 className="text-sm font-bold text-white">Spoof & Loop Detection</h4>
                  <p className="text-[11px] text-[#888888] leading-relaxed">
                    AI flags phone-screen playback, printed photos, non-human actors, or partial reps with an authenticity confidence rating (0-100%).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] space-y-2">
                  <div className="text-[10px] font-mono font-bold text-[#FF9500] uppercase">
                    3. Form & Token Minting
                  </div>
                  <h4 className="text-sm font-bold text-white">Form Score Bonuses</h4>
                  <p className="text-[11px] text-[#888888] leading-relaxed">
                    Scores above 85% earn extra screen time bonuses; fraudulent attempts trigger token burns and strike records.
                  </p>
                </div>
              </div>

              {/* Verified Schema Blueprint */}
              <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] space-y-2 font-mono text-[11px]">
                <div className="text-[#888888] font-bold uppercase">// Verification Payload & Response Pipeline:</div>
                <div className="text-[#00FF85]">Client: POST /api/verify-task-ai {'{'} frames: [base64_jpg], taskType: 'pushups', claimedReps: 15 {'}'}</div>
                <div className="text-[#00A3FF]">Server: Gemini 3.7 Flash &rarr; JSON Schema Verification Report</div>
                <div className="text-[#CCCCCC] pl-4">
                  {`{
  "verified": true,
  "confidenceScore": 96,
  "formScore": 92,
  "detectedReps": 15,
  "isCheatingDetected": false,
  "auditSummary": "Full chest-to-floor depth observed with steady cadence across 15 reps.",
  "critique": "Solid core bracing; maintain neck alignment on reps 12-15."
}`}
                </div>
              </div>
            </div>
          )}

          {/* TAB: OPEN SOURCE MODELS */}
          {activeTab === 'open_source_ml' && (
            <div className="space-y-6 font-sans">
              <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#00FF85] bg-[#00FF85]/10 px-2.5 py-1 rounded-lg border border-[#00FF85]/30 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Direct GitHub Pipeline Integration
                  </span>
                  <span className="text-[11px] text-[#888888] font-mono">2 Engines Connected</span>
                </div>
                <p className="text-xs text-[#CCCCCC] leading-relaxed">
                  The application integrates the algorithms, 3-point angle trigonometry, state machines, and posture classification rules from the two specified repositories.
                </p>
              </div>

              {/* MODEL 1: gym-computer-vision-2 */}
              <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <div className="w-6 h-6 rounded-lg bg-[#00FF85]/10 text-[#00FF85] flex items-center justify-center font-mono text-xs">
                      1
                    </div>
                    gym-computer-vision-2 (by tubakhxn)
                  </div>
                  <a
                    href="https://github.com/tubakhxn/gym-computer-vision-2"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#00FF85] hover:underline flex items-center gap-1 font-mono"
                  >
                    github.com/tubakhxn/gym-computer-vision-2 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-[#888888]">
                  Specialized for repetition counting, range-of-motion verification, and form defect warnings across gym exercises.
                </p>

                <div className="bg-[#050505] p-3.5 rounded-xl border border-[#222222] font-mono text-[11px] text-[#00FF85] space-y-1">
                  <p className="text-[#666666]">// Vector Angle Kinematics Formula</p>
                  <p>fun calculateAngle(a: Point2D, b: Point2D, c: Point2D): Float &#123;</p>
                  <p>&nbsp;&nbsp;val radians = atan2(c.y - b.y, c.x - b.x) - atan2(a.y - b.y, a.x - b.x)</p>
                  <p>&nbsp;&nbsp;var angle = abs(radians * 180.0 / PI)</p>
                  <p>&nbsp;&nbsp;if (angle &gt; 180.0) angle = 360.0 - angle</p>
                  <p>&nbsp;&nbsp;return angle.toFloat()</p>
                  <p>&#125;</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#050505] border border-[#222222]">
                    <div className="font-bold text-white">Push-ups</div>
                    <div className="text-[10px] text-[#888888]">Elbow &lt;90° (Down) • &gt;160° (Up)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#050505] border border-[#222222]">
                    <div className="font-bold text-white">Squats</div>
                    <div className="text-[10px] text-[#888888]">Knee &lt;95° (Parallel) • &gt;165° (Up)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#050505] border border-[#222222]">
                    <div className="font-bold text-white">Bicep Curls</div>
                    <div className="text-[10px] text-[#888888]">Elbow &lt;35° (Peak) • &gt;160° (Ext)</div>
                  </div>
                </div>
              </div>

              {/* MODEL 2: OpenCV_Yoga-Asanas */}
              <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <div className="w-6 h-6 rounded-lg bg-[#00A3FF]/10 text-[#00A3FF] flex items-center justify-center font-mono text-xs">
                      2
                    </div>
                    OpenCV_Yoga-Asanas (by Vasundhara-Boomi)
                  </div>
                  <a
                    href="https://github.com/Vasundhara-Boomi/OpenCV_Yoga-Asanas"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#00A3FF] hover:underline flex items-center gap-1 font-mono"
                  >
                    github.com/Vasundhara-Boomi/OpenCV_Yoga-Asanas <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-[#888888]">
                  Classifies complex isometric Asana postures and gates hold duration based on geometric stability and joint tolerances.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#050505] border border-[#222222]">
                    <div className="font-bold text-white">Virabhadrasana II (Warrior II)</div>
                    <div className="text-[11px] text-[#CCCCCC]">Front knee: 90° ± 15° • Arms: 180° parallel</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#050505] border border-[#222222]">
                    <div className="font-bold text-white">Vrikshasana (Tree Pose)</div>
                    <div className="text-[11px] text-[#CCCCCC]">Standing leg: 178° • Bent knee: 50° • Hands prayer</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#050505] border border-[#222222]">
                    <div className="font-bold text-white">Adho Mukha Svanasana (Downward Dog)</div>
                    <div className="text-[11px] text-[#CCCCCC]">Hip hinge: 70° (Inverted V) • Straight limbs: 175°</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#050505] border border-[#222222]">
                    <div className="font-bold text-white">Bhujangasana (Cobra Pose)</div>
                    <div className="text-[11px] text-[#CCCCCC]">Spinal extension: 140° • Grounded hips</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: MVVM Architecture */}
          {activeTab === 'clean_arch' && (
            <div className="space-y-4 font-sans">
              <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#00FF85]" />
                  Unidirectional Data Flow (UI → ViewModel → UseCase → Repository → Data)
                </h4>
                <p className="text-xs text-[#888888]">
                  Separates business logic completely from Jetpack Compose UI. The ViewModel exposes immutable <code>StateFlow&lt;DashboardUiState&gt;</code> that updates automatically when Room entities change.
                </p>
              </div>

              <div className="bg-[#050505] p-4 rounded-2xl border border-[#222222] font-mono text-[11px] text-[#00FF85] overflow-x-auto space-y-1">
                <p className="text-[#666666]">// Kotlin Jetpack Compose StateFlow Pattern</p>
                <p>data class WalletUiState(</p>
                <p>&nbsp;&nbsp;val availableSeconds: Long = 1800,</p>
                <p>&nbsp;&nbsp;val isInstagramLocked: Boolean = true,</p>
                <p>&nbsp;&nbsp;val currentStreak: Int = 4,</p>
                <p>&nbsp;&nbsp;val activeSession: AppSession? = null</p>
                <p>)</p>
              </div>
            </div>
          )}

          {/* TAB 2: Room SQLite Schema */}
          {activeTab === 'room_db' && (
            <div className="space-y-3">
              <div className="bg-[#050505] p-4 rounded-2xl border border-[#222222] space-y-2 font-mono text-[11px] text-[#CCCCCC]">
                <p className="text-[#00FF85] font-bold">// Room Entities &amp; Auditable Ledger Schema</p>
                <p>@Entity(tableName = &quot;blocked_apps&quot;)</p>
                <p>data class BlockedAppEntity(</p>
                <p>&nbsp;&nbsp;@PrimaryKey val packageName: String,</p>
                <p>&nbsp;&nbsp;val appName: String,</p>
                <p>&nbsp;&nbsp;val isBlocked: Boolean,</p>
                <p>&nbsp;&nbsp;val dailyAllowanceMinutes: Int,</p>
                <p>&nbsp;&nbsp;val sessionStartTime: Long?, // absolute timestamp</p>
                <p>&nbsp;&nbsp;val sessionDurationSeconds: Long</p>
                <p>)</p>
                <br />
                <p>@Entity(tableName = &quot;screen_time_transactions&quot;)</p>
                <p>data class TransactionEntity(</p>
                <p>&nbsp;&nbsp;@PrimaryKey val id: String,</p>
                <p>&nbsp;&nbsp;val type: String, // &quot;EARN_PHYSICAL&quot;, &quot;SPEND_APP&quot;, etc.</p>
                <p>&nbsp;&nbsp;val amountSeconds: Long,</p>
                <p>&nbsp;&nbsp;val timestamp: Long,</p>
                <p>&nbsp;&nbsp;val verified: Boolean</p>
                <p>)</p>
              </div>
            </div>
          )}

          {/* TAB 3: Android Blocker Mechanism */}
          {activeTab === 'app_blocker' && (
            <div className="space-y-4 font-sans">
              <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00FF85]" />
                  Dual-Mechanism Monitoring &amp; Overlay Architecture
                </h4>
                <p className="text-xs text-[#888888]">
                  Real Android implementation requires:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[#CCCCCC]">
                  <li><strong>AccessibilityService:</strong> Listens for <code>TYPE_WINDOW_STATE_CHANGED</code> events to capture foreground package switches within ~15ms.</li>
                  <li><strong>UsageStatsManager:</strong> Fallback polling service checking <code>UsageEvents.Event.ACTIVITY_RESUMED</code>.</li>
                  <li><strong>SYSTEM_ALERT_WINDOW (Overlay Permission):</strong> Displays the custom Material 3 lock screen overlay over locked applications.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: ML Repository Adapter */}
          {activeTab === 'ml_adapter' && (
            <div className="space-y-4 font-sans">
              <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222] space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#00A3FF]" />
                  ExerciseDetectionEngine Standardized ML Interface
                </h4>
                <p className="text-xs text-[#888888]">
                  Your custom Python/PyTorch/TensorFlow repository connects seamlessly via the <code>IExerciseModelAdapter</code> interface:
                </p>
              </div>

              <div className="bg-[#050505] p-4 rounded-2xl border border-[#222222] font-mono text-[11px] text-[#00A3FF] overflow-x-auto space-y-1">
                <p className="text-[#666666]">// Pluggable ML Adapter Contract</p>
                <p>interface IExerciseModelAdapter &#123;</p>
                <p>&nbsp;&nbsp;val modelName: String</p>
                <p>&nbsp;&nbsp;fun processFrame(bitmap: Bitmap): ExerciseFrameResult</p>
                <p>&nbsp;&nbsp;fun reset()</p>
                <p>&#125;</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
