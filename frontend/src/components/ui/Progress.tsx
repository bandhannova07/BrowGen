'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Flame, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  color?: 'primary' | 'accent' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ 
  value, 
  max, 
  className, 
  showLabel = false, 
  color = 'primary',
  size = 'md'
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    primary: 'bg-primary-500',
    accent: 'bg-accent-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-neutral-600 mb-1">
          <span>{value} / {max}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('bg-neutral-200 rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          className={cn('h-full rounded-full', colors[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface BadgeProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned?: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export function Badge({ 
  name, 
  description, 
  icon, 
  earned = false, 
  earnedAt,
  progress = 0,
  maxProgress = 1,
  rarity = 'common'
}: BadgeProps) {
  const rarityColors = {
    common: 'bg-neutral-100 border-neutral-300 text-neutral-600',
    rare: 'bg-primary-100 border-primary-300 text-primary-600',
    epic: 'bg-accent-100 border-accent-300 text-accent-600',
    legendary: 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300 text-yellow-700',
  };

  const earnedColors = {
    common: 'bg-neutral-500 text-white shadow-soft',
    rare: 'bg-primary-500 text-white shadow-glow',
    epic: 'bg-accent-500 text-white shadow-glow-accent',
    legendary: 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-2xl',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className={cn(
        'relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
        earned ? earnedColors[rarity] : rarityColors[rarity]
      )}
    >
      {earned && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-success-500 text-white rounded-full p-1"
        >
          <Star size={12} fill="currentColor" />
        </motion.div>
      )}
      
      <div className="text-center">
        <div className={cn(
          'w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center',
          earned ? 'bg-white/20' : 'bg-current/10'
        )}>
          {icon}
        </div>
        
        <h3 className="font-semibold text-sm mb-1">{name}</h3>
        <p className="text-xs opacity-80 mb-2">{description}</p>
        
        {!earned && maxProgress > 1 && (
          <div className="mt-2">
            <ProgressBar 
              value={progress} 
              max={maxProgress} 
              size="sm"
              color={rarity === 'common' ? 'primary' : rarity as any}
            />
            <div className="text-xs mt-1 opacity-70">
              {progress}/{maxProgress}
            </div>
          </div>
        )}
        
        {earned && earnedAt && (
          <div className="text-xs opacity-70 mt-1">
            Earned {earnedAt.toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export function StreakCounter({ currentStreak, longestStreak, className }: StreakCounterProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex items-center gap-2">
        <div className="p-2 bg-accent-100 rounded-lg">
          <Flame size={20} className="text-accent-600" />
        </div>
        <div>
          <div className="text-lg font-bold text-neutral-900">{currentStreak}</div>
          <div className="text-xs text-neutral-600">Current Streak</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="p-2 bg-warning-100 rounded-lg">
          <Trophy size={20} className="text-warning-600" />
        </div>
        <div>
          <div className="text-lg font-bold text-neutral-900">{longestStreak}</div>
          <div className="text-xs text-neutral-600">Best Streak</div>
        </div>
      </div>
    </div>
  );
}

interface PointsDisplayProps {
  points: number;
  level: number;
  pointsToNextLevel: number;
  className?: string;
}

export function PointsDisplay({ points, level, pointsToNextLevel, className }: PointsDisplayProps) {
  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Target size={20} className="text-primary-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-neutral-900">{points.toLocaleString()}</div>
            <div className="text-xs text-neutral-600">Total Points</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-primary-600">Level {level}</div>
          <div className="text-xs text-neutral-600">{pointsToNextLevel} to next level</div>
        </div>
      </div>
      
      <ProgressBar 
        value={100 - (pointsToNextLevel / 100) * 100} 
        max={100} 
        color="primary"
        size="md"
      />
    </div>
  );
}

interface CelebrationProps {
  type: 'points' | 'badge' | 'level' | 'streak';
  title: string;
  description: string;
  points?: number;
  onClose: () => void;
}

export function Celebration({ type, title, description, points, onClose }: CelebrationProps) {
  const icons = {
    points: <Target size={32} className="text-primary-600" />,
    badge: <Star size={32} className="text-accent-600" fill="currentColor" />,
    level: <Trophy size={32} className="text-warning-600" />,
    streak: <Flame size={32} className="text-accent-600" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ rotate: -5 }}
        animate={{ rotate: 0 }}
        className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 0.6,
            repeat: 2
          }}
          className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center"
        >
          {icons[type]}
        </motion.div>
        
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h2>
        <p className="text-neutral-600 mb-4">{description}</p>
        
        {points && (
          <div className="text-3xl font-bold text-primary-600 mb-4">
            +{points} points
          </div>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          Awesome!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
