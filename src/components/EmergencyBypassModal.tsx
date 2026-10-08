import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CreditCard,
  Lock,
  ShieldAlert,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import { appBlockerService } from '../services/appBlockerService';
import { BlockedApp } from '../types';

interface EmergencyBypassModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: BlockedApp[];
}

export const EmergencyBypassModal: React.FC<EmergencyBypassModalProps> = ({
  isOpen,
  onClose,
  apps,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<5 | 10 | 30>(5);
  const [selectedApp, setSelectedApp] = useState<string>(apps[0]?.packageId || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGranted, setIsGranted] = useState(false);

  if (!isOpen) return null;

  const tiers = [
    { duration: 5, price: '$0.99 (Dev Mock)', cooldown: '4h cooldown' },
    { duration: 10, price: '$1.99 (Dev Mock)', cooldown: '8h cooldown' },
    { duration: 30, price: '$3.99 (Dev Mock)', cooldown: '24h cooldown' },
  ];

  const handleGrantEmergency = () => {
    setIsProcessing(true);
    setTimeout(() => {
      appBlockerService.unlockWithEmergencyBypass(selectedApp, selectedDuration);
      setIsProcessing(false);
      setIsGranted(true);
      setTimeout(() => {
        setIsGranted(false);
        onClose();
      }, 1800);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222222] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <button
          id="close-emergency-bypass-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#111111] text-[#888888] hover:text-white border border-[#222222] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FF9500]/10 border border-[#FF9500]/30 flex items-center justify-center text-[#FF9500] shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold font-display text-white">
            Emergency Bypass Access
          </h2>
          <p className="text-xs text-[#888888]">
            For critical tasks only. Production builds integrate Google Play Billing API with strict cooldown limits.
          </p>
        </div>

        {/* Select Target App */}
        <div className="text-left space-y-1.5">
          <label className="block text-xs font-semibold text-[#CCCCCC] uppercase tracking-wider">
            Select Application to Override
          </label>
          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#222222] rounded-xl text-xs text-white focus:outline-none focus:border-[#FF9500]"
          >
            {apps.map((a) => (
              <option key={a.packageId} value={a.packageId}>
                {a.name} ({a.packageId})
              </option>
            ))}
          </select>
        </div>

        {/* Select Duration Tier */}
        <div className="grid grid-cols-3 gap-2">
          {tiers.map((t) => {
            const isSel = selectedDuration === t.duration;
            return (
              <button
                key={t.duration}
                type="button"
                onClick={() => setSelectedDuration(t.duration as 5 | 10 | 30)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#FF9500]/10 border-[#FF9500]/60 text-white'
                    : 'bg-[#111111] border-[#222222] text-[#888888] hover:border-[#333333]'
                }`}
              >
                <div className="text-lg font-bold font-display">{t.duration}m</div>
                <div className="text-[10px] text-[#FF9500] font-mono mt-0.5">{t.price}</div>
                <div className="text-[9px] text-[#666666] mt-1">{t.cooldown}</div>
              </button>
            );
          })}
        </div>

        {/* Warning Note */}
        <div className="bg-[#FF9500]/10 border border-[#FF9500]/20 p-3 rounded-xl text-left text-[11px] text-[#FF9500] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF9500] shrink-0 mt-0.5" />
          <span>
            Development Mode Sandbox: Emergency unlocks are logged to the Screen Time transaction ledger for audit transparency.
          </span>
        </div>

        <button
          id="confirm-emergency-unlock-btn"
          disabled={isProcessing || isGranted}
          onClick={handleGrantEmergency}
          className="w-full py-3.5 rounded-xl bg-[#FF9500] hover:bg-[#ffaa33] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF9500]/25 cursor-pointer transition-all disabled:opacity-50"
        >
          {isProcessing ? 'Connecting Google Play Sandbox...' : isGranted ? 'Access Granted!' : `Authorize ${selectedDuration}m Emergency Access`}
        </button>
      </div>
    </div>
  );
};
