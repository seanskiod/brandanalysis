
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, Calendar } from 'lucide-react';
import { getTopProgressiveCompanies } from '@/api/functions';
import { format } from 'date-fns';

const ProgressCard = ({ company }) => {
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

  const displayLogoUrl = logoOverrides[company.companyName] || company.logoUrl;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 min-w-[350px] mx-4">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden p-2">
          <img 
            src={displayLogoUrl}
            alt={`${company.companyName} logo`}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.companyName)}&background=287de0&color=fff&size=64&format=png`;
            }}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{company.companyName}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{company.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">Previous</div>
            <div className="text-2xl font-bold text-gray-700">{company.oldScore}</div>
          </div>
          <div className="flex items-center">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Latest</div>
            <div className="text-2xl font-bold text-[#287de0]">{company.newScore}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
            <TrendingUp className="w-5 h-5" />
            +{company.percentageChange}%
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(company.auditDate), 'MMM d, yyyy')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProgressiveCompaniesCarousel() {
  const [companies, setCompanies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to load progressive companies data once on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await getTopProgressiveCompanies();
        if (error) throw new Error(error.error || 'Failed to load progressive companies');
        
        setCompanies(data || []);
      } catch (err) {
        console.error('Error loading progressive companies:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect for auto-rotating the carousel
  useEffect(() => {
    let interval;
    // Only start the interval if data has loaded and there are companies to display
    if (!isLoading && companies.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % companies.length);
      }, 5000);
    }
    
    // Cleanup function to clear the interval when the component unmounts
    // or when dependencies (companies, isLoading) change, triggering re-run
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [companies, isLoading]); // Re-run when companies data or loading status changes

  const nextSlide = () => {
    if (companies.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % companies.length);
    }
  };

  const prevSlide = () => {
    if (companies.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + companies.length) % companies.length);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-8 h-8 border-4 border-[#287de0]/20 border-t-[#287de0] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading success stories...</p>
        </div>
      </div>
    );
  }

  // If there's an error or no companies data after loading, don't show the section
  if (error || companies.length === 0) {
    return null; 
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Brands that have significantly improved their AI Search Visibility scores through strategic optimizations.
          </p>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="flex justify-center"
              >
                {/* Ensure companies[currentIndex] is valid before rendering */}
                {companies[currentIndex] && <ProgressCard company={companies[currentIndex]} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {companies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-[#287de0]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
