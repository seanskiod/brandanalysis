import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Timer } from 'lucide-react';

const LogoLoader = ({ progress, companyName, message, onComplete, elapsedTime = null }) => {
  const [showBrandLogo, setShowBrandLogo] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress / 100 * circumference;

  React.useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setShowBrandLogo(true);
        setTimeout(() => {
          setShowDashboard(true);
          if (onComplete) onComplete();
        }, 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const getTimerStyle = (time) => {
    if (time === null) return {};

    const GREEN_TIME = 20;
    const YELLOW_TIME = 35;
    const RED_TIME = 45;

    // Colors
    const GREEN = [34, 197, 94]; // text-green-500
    const YELLOW = [234, 179, 8]; // text-yellow-500
    const RED = [239, 68, 68]; // text-red-500

    let r, g, b;

    if (time <= GREEN_TIME) {
      [r, g, b] = GREEN;
    } else if (time <= YELLOW_TIME) {
      const progress = (time - GREEN_TIME) / (YELLOW_TIME - GREEN_TIME);
      r = Math.round(GREEN[0] + (YELLOW[0] - GREEN[0]) * progress);
      g = Math.round(GREEN[1] + (YELLOW[1] - GREEN[1]) * progress);
      b = Math.round(GREEN[2] + (YELLOW[2] - GREEN[2]) * progress);
    } else if (time <= RED_TIME) {
      const progress = (time - YELLOW_TIME) / (RED_TIME - YELLOW_TIME);
      r = Math.round(YELLOW[0] + (RED[0] - YELLOW[0]) * progress);
      g = Math.round(YELLOW[1] + (RED[1] - YELLOW[1]) * progress);
      b = Math.round(YELLOW[2] + (RED[2] - YELLOW[2]) * progress);
    } else {
      [r, g, b] = RED;
    }

    return { color: `rgb(${r}, ${g}, ${b})` };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center">

            <AnimatePresence mode="wait">
                {!showBrandLogo ?
        <motion.div
          key="company-analysis"
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}>

                        <div className="relative w-40 h-40 mx-auto mb-6">
                            <svg className="w-full h-full" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                                <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6" />

                                <motion.circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#287de0"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.5, ease: 'linear' }} />

                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center p-8">
                                <AnimatePresence>
                                    {progress < 100 ?
                <motion.img
                  key="logo"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  src={`https://logo.clearbit.com/${companyName.toLowerCase().replace(/\s+/g, '')}.com`}
                  alt={companyName}
                  className="w-full h-full rounded-full object-contain"
                  onError={(e) => {e.target.style.display = 'none';}} /> :


                <motion.div
                  key="checkmark"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}>

                                            <Check className="w-16 h-16 text-green-500" />
                                        </motion.div>
                }
                                </AnimatePresence>
                            </div>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            {progress < 100 ?
            <>
                                    Analyzing <span className="text-[#287de0]">{companyName}</span>
                                </> :
            'Analysis Complete'}
                        </h2>
                        <p className="text-gray-600 min-h-[24px]">{message}</p>
                        
                        {elapsedTime !== null && progress < 100 &&
          <div className="mt-4 flex flex-col items-center">
                                <div className="mx-2 px-2 flex items-center gap-2">
                                    <Timer className="w-5 h-5 text-gray-500" />
                                    <p style={getTimerStyle(elapsedTime)} className="text-2xl font-mono font-semibold transition-colors duration-500">
                                        {formatTime(elapsedTime)}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Avg. Audit Time: 00:45</p>
                            </div>
          }
                    </motion.div> :
        showDashboard ? null :
        <motion.div
          key="brand-logo"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            duration: 1.5
          }}
          className="flex flex-col items-center">

                        <div className="w-32 h-32 mb-6">
                            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/63e426ec5_BrandRankLogo.png"
              alt="BrandRank.AI"
              className="w-full h-full object-contain" />

                        </div>
                        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-gray-900 mb-2">

                            Analysis Ready
                        </motion.h2>
                        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-gray-600">

                            Powered by BrandRank.AI
                        </motion.p>
                    </motion.div>
        }
            </AnimatePresence>
        </motion.div>);

};

export default LogoLoader;