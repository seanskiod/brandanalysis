import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClickableScoreCard({ title, score, description, icon: Icon, to, index }) {
  const navigate = useNavigate();
  const safeScore = score ?? 0;

  const handleClick = () => {
    navigate(to);
  };

  const getScoreColor = (s) => {
    if (s >= 8) return 'text-green-500';
    if (s >= 6) return 'text-yellow-500';
    if (s >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreRingColor = (s) => {
    if (s >= 8) return 'stroke-green-500';
    if (s >= 6) return 'stroke-yellow-500';
    if (s >= 4) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  const percentage = (safeScore / 10) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
      onClick={handleClick}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#287de0]/10 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#287de0]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path className="stroke-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
            <motion.path
              className={getScoreRingColor(safeScore)}
              initial={{ strokeDasharray: `0, 100` }}
              animate={{ strokeDasharray: `${percentage}, 100` }}
              transition={{ duration: 1, delay: 0.6, ease: 'easeInOut' }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" strokeWidth="3" strokeDasharray="0, 100" strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getScoreColor(safeScore)}`}>{safeScore.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
      <div className="flex items-center justify-end text-[#287de0] font-medium group-hover:underline">
        View Details
        <ChevronRight className="w-5 h-5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </motion.div>
  );
}