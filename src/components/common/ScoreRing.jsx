import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreRing({ score, size = "w-24 h-24", strokeWidth = 4, fontSize = "text-3xl" }) {
  const safeScore = score ?? 0;

  const getScoreColor = (s) => {
    if (s >= 8) return 'text-green-600';
    if (s >= 6) return 'text-yellow-600';
    if (s >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreRingColor = (s) => {
    if (s >= 8) return 'stroke-green-500';
    if (s >= 6) return 'stroke-yellow-500';
    if (s >= 4) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  const percentage = (safeScore / 10) * 100;
  const radius = 18 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`relative ${size} flex-shrink-0`}>
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <circle
          className="stroke-gray-200"
          cx="18" cy="18" r={radius}
          fill="none" strokeWidth={strokeWidth}
        />
        <motion.circle
          className={getScoreRingColor(safeScore)}
          cx="18" cy="18" r={radius}
          fill="none" strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          transform="rotate(-90 18 18)"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${fontSize} font-bold ${getScoreColor(safeScore)}`}>
          {safeScore.toFixed(1)}
        </span>
      </div>
    </div>
  );
}