import React from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Boxes,
  Brain,
  CheckSquare,
  Compass,
  Cpu,
  Droplets,
  Dumbbell,
  Eye,
  Feather,
  Flame,
  Flower2,
  Footprints,
  Grid,
  Hash,
  HeartPulse,
  Hourglass,
  Layers,
  Palette,
  PenTool,
  ShieldCheck,
  Sparkles,
  Sun,
  Timer,
  Trees,
  TrendingUp,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';
import { ExerciseType } from '../types';

export interface ActivityIconProps {
  activityId?: ExerciseType | string;
  iconName?: string;
  category?: 'physical' | 'mental' | 'circuit' | 'habit';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
  interactive?: boolean;
}

export interface ActivityVisualMeta {
  icon: React.ReactNode;
  emoji: string;
  label: string;
  colorHex: string;
  bgGradient: string;
  borderClass: string;
  badgeBg: string;
  glowColor: string;
}

export const getActivityVisualMeta = (
  activityId?: string,
  iconName?: string,
  category?: string
): ActivityVisualMeta => {
  const key = (activityId || iconName || '').toLowerCase();

  // 1. Physical: Push-ups
  if (key.includes('pushup')) {
    return {
      icon: <Dumbbell className="w-full h-full" />,
      emoji: '💪',
      label: 'Push-ups',
      colorHex: '#FF9F0A',
      bgGradient: 'bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-red-500/20 text-[#FF9F0A]',
      borderClass: 'border-amber-500/30 group-hover:border-amber-400/60',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      glowColor: 'shadow-amber-500/20',
    };
  }

  // 2. Physical: Squats
  if (key.includes('squat')) {
    return {
      icon: <Flame className="w-full h-full" />,
      emoji: '🔥',
      label: 'Squats',
      colorHex: '#FF453A',
      bgGradient: 'bg-gradient-to-br from-orange-500/20 via-red-500/20 to-amber-600/20 text-[#FF453A]',
      borderClass: 'border-red-500/30 group-hover:border-red-400/60',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30',
      glowColor: 'shadow-red-500/20',
    };
  }

  // 3. Circuit: 3-Min Power Circuit
  if (key.includes('circuit')) {
    return {
      icon: <Zap className="w-full h-full" />,
      emoji: '⚡',
      label: 'Power Circuit',
      colorHex: '#30D158',
      bgGradient: 'bg-gradient-to-br from-[#30D158]/25 via-[#0A84FF]/20 to-[#BF5AF2]/20 text-[#30D158]',
      borderClass: 'border-[#30D158]/40 group-hover:border-[#30D158]',
      badgeBg: 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/40',
      glowColor: 'shadow-[#30D158]/30',
    };
  }

  // 4. Physical: Jumping Jacks Cardio
  if (key.includes('jumping_jack') || key.includes('jumping')) {
    return {
      icon: <HeartPulse className="w-full h-full" />,
      emoji: '⭐',
      label: 'Jumping Jacks',
      colorHex: '#64D2FF',
      bgGradient: 'bg-gradient-to-br from-sky-500/20 via-cyan-500/20 to-blue-500/20 text-[#64D2FF]',
      borderClass: 'border-sky-500/30 group-hover:border-sky-400/60',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      glowColor: 'shadow-sky-500/20',
    };
  }

  // 5. Physical: Bicep Curls
  if (key.includes('bicep') || key.includes('curl')) {
    return {
      icon: <Award className="w-full h-full" />,
      emoji: '🏋️',
      label: 'Bicep Curls',
      colorHex: '#BF5AF2',
      bgGradient: 'bg-gradient-to-br from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 text-[#BF5AF2]',
      borderClass: 'border-purple-500/30 group-hover:border-purple-400/60',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      glowColor: 'shadow-purple-500/20',
    };
  }

  // 6. Physical: Forward Lunges
  if (key.includes('lunge')) {
    return {
      icon: <Footprints className="w-full h-full" />,
      emoji: '👟',
      label: 'Lunges',
      colorHex: '#FF9F0A',
      bgGradient: 'bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 text-[#FFD60A]',
      borderClass: 'border-yellow-500/30 group-hover:border-yellow-400/60',
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      glowColor: 'shadow-yellow-500/20',
    };
  }

  // 7. Physical: Core Plank
  if (key.includes('plank')) {
    return {
      icon: <Hourglass className="w-full h-full" />,
      emoji: '📐',
      label: 'Core Plank',
      colorHex: '#30D158',
      bgGradient: 'bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-green-500/20 text-[#30D158]',
      borderClass: 'border-emerald-500/30 group-hover:border-emerald-400/60',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      glowColor: 'shadow-emerald-500/20',
    };
  }

  // 8. Physical: Pull-ups
  if (key.includes('pullup')) {
    return {
      icon: <TrendingUp className="w-full h-full" />,
      emoji: '🔝',
      label: 'Pull-ups',
      colorHex: '#0A84FF',
      bgGradient: 'bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-cyan-500/20 text-[#0A84FF]',
      borderClass: 'border-blue-500/30 group-hover:border-blue-400/60',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      glowColor: 'shadow-blue-500/20',
    };
  }

  // 9. Physical/Mental: Yoga Asanas
  if (key.includes('yoga') || key.includes('asana')) {
    return {
      icon: <Flower2 className="w-full h-full" />,
      emoji: '🧘',
      label: 'Yoga Asanas',
      colorHex: '#FF375F',
      bgGradient: 'bg-gradient-to-br from-rose-500/20 via-pink-500/20 to-purple-500/20 text-[#FF375F]',
      borderClass: 'border-rose-500/30 group-hover:border-rose-400/60',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      glowColor: 'shadow-rose-500/20',
    };
  }

  // 10. Physical: Step Goal Walking
  if (key.includes('walk') || key.includes('step')) {
    return {
      icon: <Footprints className="w-full h-full" />,
      emoji: '🚶',
      label: 'Step Goal',
      colorHex: '#30D158',
      bgGradient: 'bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-lime-500/20 text-[#30D158]',
      borderClass: 'border-green-500/30 group-hover:border-green-400/60',
      badgeBg: 'bg-green-500/20 text-green-300 border-green-500/30',
      glowColor: 'shadow-green-500/20',
    };
  }

  // 11. Physical: Running
  if (key.includes('run')) {
    return {
      icon: <Flame className="w-full h-full" />,
      emoji: '🏃',
      label: 'Running',
      colorHex: '#FF9F0A',
      bgGradient: 'bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-red-500/20 text-[#FF9F0A]',
      borderClass: 'border-orange-500/30 group-hover:border-orange-400/60',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      glowColor: 'shadow-orange-500/20',
    };
  }

  // 12. Mental: Stroop Cognitive Reset
  if (key.includes('stroop')) {
    return {
      icon: <Palette className="w-full h-full" />,
      emoji: '🎨',
      label: 'Stroop Test',
      colorHex: '#BF5AF2',
      bgGradient: 'bg-gradient-to-br from-violet-500/25 via-pink-500/20 to-amber-500/20 text-[#BF5AF2]',
      borderClass: 'border-violet-500/30 group-hover:border-violet-400/60',
      badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      glowColor: 'shadow-violet-500/20',
    };
  }

  // 13. Mental: Dual N-Back Working Memory
  if (key.includes('nback') || key.includes('dual_nback')) {
    return {
      icon: <Cpu className="w-full h-full" />,
      emoji: '🧠',
      label: 'Dual N-Back',
      colorHex: '#0A84FF',
      bgGradient: 'bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 text-[#0A84FF]',
      borderClass: 'border-cyan-500/30 group-hover:border-cyan-400/60',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      glowColor: 'shadow-cyan-500/20',
    };
  }

  // 14. Mental: Memory Matrix
  if (key.includes('memory')) {
    return {
      icon: <Boxes className="w-full h-full" />,
      emoji: '🧩',
      label: 'Memory Grid',
      colorHex: '#5E5CE6',
      bgGradient: 'bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20 text-[#5E5CE6]',
      borderClass: 'border-indigo-500/30 group-hover:border-indigo-400/60',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      glowColor: 'shadow-indigo-500/20',
    };
  }

  // 15. Mental: Zen Sudoku
  if (key.includes('sudoku')) {
    return {
      icon: <Hash className="w-full h-full" />,
      emoji: '🔢',
      label: 'Zen Sudoku',
      colorHex: '#FFD60A',
      bgGradient: 'bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-orange-500/20 text-[#FFD60A]',
      borderClass: 'border-yellow-500/30 group-hover:border-yellow-400/60',
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      glowColor: 'shadow-yellow-500/20',
    };
  }

  // 16. Mental / Habit: Reading
  if (key.includes('read') || key.includes('book')) {
    return {
      icon: <BookOpen className="w-full h-full" />,
      emoji: '📚',
      label: 'Deep Reading',
      colorHex: '#FF9F0A',
      bgGradient: 'bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 text-[#FF9F0A]',
      borderClass: 'border-amber-500/30 group-hover:border-amber-400/60',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      glowColor: 'shadow-amber-500/20',
    };
  }

  // 17. Mental: Box Breathing
  if (key.includes('breath') || key.includes('wind')) {
    return {
      icon: <Wind className="w-full h-full" />,
      emoji: '💨',
      label: 'Box Breathing',
      colorHex: '#64D2FF',
      bgGradient: 'bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-sky-500/20 text-[#64D2FF]',
      borderClass: 'border-teal-500/30 group-hover:border-teal-400/60',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      glowColor: 'shadow-teal-500/20',
    };
  }

  // 18. Mental: Mindful Meditation
  if (key.includes('meditat')) {
    return {
      icon: <Sun className="w-full h-full" />,
      emoji: '🪷',
      label: 'Meditation',
      colorHex: '#BF5AF2',
      bgGradient: 'bg-gradient-to-br from-purple-500/20 via-rose-500/20 to-indigo-500/20 text-[#BF5AF2]',
      borderClass: 'border-purple-500/30 group-hover:border-purple-400/60',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      glowColor: 'shadow-purple-500/20',
    };
  }

  // 19. Habit: Journaling
  if (key.includes('journal') || key.includes('edit')) {
    return {
      icon: <PenTool className="w-full h-full" />,
      emoji: '✍️',
      label: 'Journaling',
      colorHex: '#FF375F',
      bgGradient: 'bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-orange-500/20 text-[#FF375F]',
      borderClass: 'border-pink-500/30 group-hover:border-pink-400/60',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      glowColor: 'shadow-pink-500/20',
    };
  }

  // 20. Habit: Hydration
  if (key.includes('hydrat') || key.includes('water') || key.includes('drop')) {
    return {
      icon: <Droplets className="w-full h-full" />,
      emoji: '💧',
      label: 'Hydration',
      colorHex: '#0A84FF',
      bgGradient: 'bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-sky-500/20 text-[#0A84FF]',
      borderClass: 'border-blue-500/30 group-hover:border-blue-400/60',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      glowColor: 'shadow-blue-500/20',
    };
  }

  // 21. Habit: Nature Walk
  if (key.includes('nature') || key.includes('outdoor') || key.includes('tree')) {
    return {
      icon: <Trees className="w-full h-full" />,
      emoji: '🌲',
      label: 'Nature Walk',
      colorHex: '#30D158',
      bgGradient: 'bg-gradient-to-br from-emerald-500/20 via-green-600/20 to-teal-500/20 text-[#30D158]',
      borderClass: 'border-emerald-500/30 group-hover:border-emerald-400/60',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      glowColor: 'shadow-emerald-500/20',
    };
  }

  // 22. Habit: Desk Workspace Clean
  if (key.includes('desk') || key.includes('clean') || key.includes('space')) {
    return {
      icon: <CheckSquare className="w-full h-full" />,
      emoji: '🧹',
      label: 'Clean Workspace',
      colorHex: '#BF5AF2',
      bgGradient: 'bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-[#BF5AF2]',
      borderClass: 'border-indigo-500/30 group-hover:border-indigo-400/60',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      glowColor: 'shadow-indigo-500/20',
    };
  }

  // 23. Habit: Exercise Mat / Workout
  if (key.includes('mat') || key.includes('workout')) {
    return {
      icon: <Dumbbell className="w-full h-full" />,
      emoji: '🧘‍♂️',
      label: 'Workout Mat',
      colorHex: '#FF453A',
      bgGradient: 'bg-gradient-to-br from-red-500/20 via-orange-500/20 to-amber-500/20 text-[#FF453A]',
      borderClass: 'border-red-500/30 group-hover:border-red-400/60',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30',
      glowColor: 'shadow-red-500/20',
    };
  }

  // Default Fallback
  const isPhysical = category === 'physical';
  return {
    icon: isPhysical ? <Activity className="w-full h-full" /> : <Brain className="w-full h-full" />,
    emoji: isPhysical ? '⚡' : '✨',
    label: isPhysical ? 'Exercise' : 'Focus Quest',
    colorHex: isPhysical ? '#30D158' : '#0A84FF',
    bgGradient: isPhysical
      ? 'bg-gradient-to-br from-[#30D158]/20 to-emerald-500/20 text-[#30D158]'
      : 'bg-gradient-to-br from-[#0A84FF]/20 to-cyan-500/20 text-[#0A84FF]',
    borderClass: isPhysical ? 'border-[#30D158]/30' : 'border-[#0A84FF]/30',
    badgeBg: isPhysical ? 'bg-[#30D158]/20 text-[#30D158]' : 'bg-[#0A84FF]/20 text-[#0A84FF]',
    glowColor: isPhysical ? 'shadow-[#30D158]/20' : 'shadow-[#0A84FF]/20',
  };
};

export const ActivityIcon: React.FC<ActivityIconProps> = ({
  activityId,
  iconName,
  category,
  size = 'md',
  showBadge = true,
  className = '',
  interactive = true,
}) => {
  const meta = getActivityVisualMeta(activityId, iconName, category);

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5 rounded-xl text-xs',
    md: 'w-10 h-10 p-2.5 rounded-2xl text-sm',
    lg: 'w-12 h-12 p-3 rounded-2xl text-base',
    xl: 'w-16 h-16 p-4 rounded-3xl text-xl',
  };

  const badgeSizes = {
    sm: 'w-3.5 h-3.5 text-[8px] -top-1 -right-1',
    md: 'w-4.5 h-4.5 text-[10px] -top-1 -right-1',
    lg: 'w-5 h-5 text-xs -top-1.5 -right-1.5',
    xl: 'w-6 h-6 text-sm -top-2 -right-2',
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {/* Playful Ambient Background Container */}
      <div
        className={`${sizeClasses[size]} ${meta.bgGradient} border ${meta.borderClass} flex items-center justify-center shadow-lg ${meta.glowColor} ${
          interactive
            ? 'transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 active:scale-95'
            : ''
        }`}
      >
        <div className="w-full h-full flex items-center justify-center">{meta.icon}</div>
      </div>

      {/* Playful Micro Emoji Badge */}
      {showBadge && (
        <span
          className={`absolute ${badgeSizes[size]} rounded-full bg-black/80 border border-white/20 flex items-center justify-center shadow-sm select-none pointer-events-none transition-transform group-hover:scale-125`}
          title={meta.label}
        >
          {meta.emoji}
        </span>
      )}
    </div>
  );
};
