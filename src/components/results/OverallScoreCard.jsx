
import React from 'react';
import { motion } from 'framer-motion';

export default function OverallScoreCard({ score, companyName }) {
  const safeScore = score ?? 0;

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

  const logoOverrides = {
    'McDonald\'s': 'https://i.pinimg.com/736x/eb/70/22/eb7022d9db13ba43cdf5507dabf4cd4a.jpg',
    'L\'Oréal': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8FceHy5907276w8XDskf1ivTOsE9bYOd2s-rI7rwbBMw9zdic4W-vSu3xjNJn5X324lQ&usqp=CAU',
    'Eli Lilly': 'https://pbs.twimg.com/profile_images/1542612027142717442/q2BxTXTj_200x200.png',
    'Nissan': 'https://cdn.brandfetch.io/idXrbmGXhc/w/960/h/960/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1750108998315',
    'AT&T': 'https://i.pinimg.com/280x280_RS/61/92/42/61924248467bfcc7c6deb931372c475e.jpg',
    'UnitedHealth': 'https://play-lh.googleusercontent.com/wbBhGUZBcwxy6iUp1wWoJM6PC29lL4oHMvOVeAviVdm9Bpd_i3slI9JiOpjnfhChUJI',
    'Bank of America': 'https://icons.veryicon.com/png/o/business/bank-logo-collection/bank-of-america-logo.png',
    'Johnson & Johnson': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2wSP9KyRWVtSYRd_GjuL9ss9tY6Nsi3-Lkg&s',
    'Nestlé': 'https://thediylighthouse.com/wp-content/uploads/2018/01/Brand-Logo-Nestle.png',
    'Kweichow Moutai': 'https://companieslogo.com/img/orig/600519.SS-44f59cd2.png?t=1720244490'
  };

  const displayLogoUrl = logoOverrides[companyName] || `https://logo.clearbit.com/${companyName.toLowerCase().replace(/\s+/g, '').replace(/&/g, 'and')}.com`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 w-full"
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="stroke-gray-200"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="3"
            />
            <motion.path
              className={getScoreRingColor(safeScore)}
              initial={{ strokeDasharray: `0, 100` }}
              animate={{ strokeDasharray: `${percentage}, 100` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="3"
              strokeDasharray="0, 100"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${getScoreColor(safeScore)}`}>
              {safeScore.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">/ 10</span>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{companyName} Overall Brand Score</h2>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Composite score for {companyName} performance across OpenAI. It is a leading indicator of brand superiority in the answer economy.
          </p>
        </div>
        <div className="w-40 h-40 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden p-4">
          <img 
            src={displayLogoUrl} 
            alt={`${companyName} logo`} 
            className="w-full h-full object-contain"
            onError={(e) => { 
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=287de0&color=fff&size=128&format=png`;
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
