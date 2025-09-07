
import React from 'react';
import { motion } from 'framer-motion';
import ScoreRing from '../common/ScoreRing';

export default function CompanyHeaderCard({ companyName, score, description, lastUpdate, logoUrl, title }) {
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
  
  // Always construct the logo URL for consistency, matching the working loader logic.
  // Changed logic to directly generate a base URL for logos,
  // focusing on a consistent format for clearbit and relying on the onError for fallbacks.
  const displayLogoUrl = logoOverrides[companyName] || `https://logo.clearbit.com/${companyName.toLowerCase().replace(/\s+/g, '').replace(/&/g, 'and')}.com`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
    >
      <div className="flex items-center gap-6">
        <ScoreRing score={score} size="w-24 h-24" strokeWidth={4} fontSize="text-3xl" />
        
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{companyName} {title || 'Content Readiness'}</h2>
          <p className="text-gray-600 leading-relaxed mb-3">{description}</p>
          <p className="text-sm text-gray-500">Last Update: {lastUpdate}</p>
        </div>
        
        <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden p-3">
          <img 
            src={displayLogoUrl} 
            alt={`${companyName} logo`} 
            className="w-full h-full object-contain" 
            onError={(e) => { 
              // Simplified error handling: directly fall back to UI-Avatars if the initial logo fails
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=287de0&color=fff&size=128&format=png`;
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
