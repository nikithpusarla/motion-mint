import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Gift,
  Lock,
  Plus,
  Shield,
  Sliders,
  Wallet,
  X,
  ShieldCheck,
  Eye,
  Sparkles,
} from 'lucide-react';
import { repository } from '../services/storageRepository';
import { AIVerificationModal } from './AIVerificationModal';
import { AIVerificationResult, BlockedApp, ScreenTimeTransaction, ScreenTimeWallet } from '../types';

interface WalletLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: ScreenTimeWallet;
  transactions: ScreenTimeTransaction[];
  apps: BlockedApp[];
}

export const WalletLedgerModal: React.FC<WalletLedgerModalProps> = ({
  isOpen,
  onClose,
  wallet,
  transactions,
  apps,
}) => {
  const [selectedAIAudit, setSelectedAIAudit] = useState<AIVerificationResult | null>(null);
  const [auditTaskTitle, setAuditTaskTitle] = useState<string>('');

  if (!isOpen) return null;

  const handleUpdateAllowance = (packageId: string, minutes: number) => {
    repository.updateApp(packageId, {
      dailyAllowanceMinutes: Math.max(0, minutes),
    });
  };

  const handleUpdateMaxDailyCap = (minutes: number) => {
    repository.updateWallet({
      maxDailyCapSeconds: Math.max(30 * 60, minutes * 60),
    });
  };

  const availableMinutes = Math.floor(wallet.balanceSeconds / 60);
  const totalEarnedMinutes = Math.floor(wallet.totalEarnedSeconds / 60);
  const totalUsedMinutes = Math.floor(wallet.totalUsedSeconds / 60);
  const dailyCapMinutes = Math.floor(wallet.maxDailyCapSeconds / 60);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/30">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Screen Time Wallet &amp; Ledger
              </h2>
              <p className="text-xs text-[#888888]">
                Auditable transaction history with AI Vision proof verification &amp; tamper-proof timestamps.
              </p>
            </div>
          </div>
          <button
            id="close-ledger-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full bg-[#111111] text-[#888888] hover:text-white border border-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#00FF85]/10 border border-[#00FF85]/30">
            <div className="text-[10px] uppercase font-bold text-[#00FF85]">
              Available Balance
            </div>
            <div className="text-2xl font-bold font-display text-white mt-1">
              {availableMinutes} <span className="text-xs font-normal text-[#00FF85]">min</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222]">
            <div className="text-[10px] uppercase font-bold text-[#888888]">
              Lifetime Earned
            </div>
            <div className="text-2xl font-bold font-display text-[#00FF85] mt-1">
              +{totalEarnedMinutes} <span className="text-xs font-normal text-[#888888]">min</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222]">
            <div className="text-[10px] uppercase font-bold text-[#888888]">
              Lifetime Used
            </div>
            <div className="text-2xl font-bold font-display text-[#CCCCCC] mt-1">
              {totalUsedMinutes} <span className="text-xs font-normal text-[#888888]">min</span>
            </div>
          </div>
        </div>

        {/* Daily Allowance & Limits Settings */}
        <div className="bg-[#111111] p-4 rounded-2xl border border-[#222222] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#00FF85]" /> Daily Allowance &amp; Max Cap Config
            </span>
            <span className="text-[#888888] font-normal lowercase">configurable limits</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] text-[#888888] mb-1">
                Max Earnable Screen Time / Day ({dailyCapMinutes} min):
              </label>
              <input
                id="max-daily-cap-slider"
                type="range"
                min="30"
                max="240"
                step="15"
                value={dailyCapMinutes}
                onChange={(e) => handleUpdateMaxDailyCap(Number(e.target.value))}
                className="w-full accent-[#00FF85]"
              />
            </div>

            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {apps.map((app) => (
                <div key={app.packageId} className="flex items-center justify-between text-xs">
                  <span className="text-[#CCCCCC]">{app.name} Allowance:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={app.dailyAllowanceMinutes}
                      onChange={(e) => handleUpdateAllowance(app.packageId, Number(e.target.value))}
                      className="w-14 px-2 py-0.5 bg-[#0A0A0A] border border-[#333333] rounded text-center text-white font-mono text-xs"
                    />
                    <span className="text-[10px] text-[#666666]">min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
          <div className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Audit Ledger ({transactions.length} events)</span>
            <span className="text-[10px] font-mono text-[#00FF85] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Gemini AI Verification Audited
            </span>
          </div>

          {transactions.map((tx) => {
            const isEarn = tx.amountSeconds > 0;
            const minutes = Math.round(Math.abs(tx.amountSeconds) / 60);

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#111111] border border-[#222222] hover:border-[#333333] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      tx.type === 'WELCOME_BONUS'
                        ? 'bg-[#FF9500]/20 text-[#FF9500]'
                        : isEarn
                        ? 'bg-[#00FF85]/20 text-[#00FF85]'
                        : 'bg-[#FF3B30]/20 text-[#FF3B30]'
                    }`}
                  >
                    {tx.type === 'WELCOME_BONUS' ? (
                      <Gift className="w-4 h-4" />
                    ) : isEarn ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{tx.description}</span>
                      {tx.aiVerification && (
                        <button
                          onClick={() => {
                            setSelectedAIAudit(tx.aiVerification || null);
                            setAuditTaskTitle(tx.activityName || 'Verified Task');
                          }}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30 hover:bg-[#00FF85]/25 flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI Proof</span>
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] text-[#666666] font-mono">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Bal: {Math.floor(tx.balanceAfterSeconds / 60)}m
                    </div>
                  </div>
                </div>

                <div
                  className={`font-mono text-xs font-bold ${
                    isEarn ? 'text-[#00FF85]' : 'text-[#FF3B30]'
                  }`}
                >
                  {isEarn ? `+${minutes}m` : `-${minutes}m`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Verification Audit Detail Modal */}
      {selectedAIAudit && (
        <AIVerificationModal
          isOpen={!!selectedAIAudit}
          onClose={() => setSelectedAIAudit(null)}
          result={selectedAIAudit}
          taskTitle={auditTaskTitle}
        />
      )}
    </div>
  );
};
