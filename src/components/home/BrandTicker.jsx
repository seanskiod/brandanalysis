import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import LoginModal from '../auth/LoginModal';
import { BrandAudit } from '@/api/entities';

const allBrands = [
  { name: 'Apple' },
  { name: 'Microsoft' },
  { name: 'Amazon' },
  { name: 'Google' },
  { name: 'Tesla' },
  { name: 'Meta' },
  { name: 'Nvidia' },
  { name: 'Berkshire Hathaway' },
  { name: 'JPMorgan Chase' },
  { name: 'Johnson & Johnson', logoOverride: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2wSP9KyRWVtSYRd_GjuL9ss9tY6Nsi3-Lkg&s' },
  { name: 'Visa' },
  { name: 'Procter & Gamble' },
  { name: 'Mastercard' },
  { name: 'UnitedHealth', logoOverride: 'https://play-lh.googleusercontent.com/wbBhGUZBcwxy6iUp1wWoJM6PC29lL4oHMvOVeAviVdm9Bpd_i3slI9JiOpjnfhChUJI' },
  { name: 'Home Depot' },
  { name: 'Pfizer' },
  { name: 'Bank of America', logoOverride: 'https://icons.veryicon.com/png/o/business/bank-logo-collection/bank-of-america-logo.png' },
  { name: 'Chevron' },
  { name: 'Coca-Cola' },
  { name: 'Walmart' },
  { name: 'Disney' },
  { name: 'Oracle' },
  { name: 'Netflix' },
  { name: 'Salesforce' },
  { name: 'Adobe' },
  { name: 'Intel' },
  { name: 'Cisco' },
  { name: 'Comcast' },
  { name: 'PepsiCo' },
  { name: 'Abbott' },
  { name: 'McDonald\'s', logoOverride: 'https://i.pinimg.com/736x/eb/70/22/eb7022d9db13ba43cdf5507dabf4cd4a.jpg' },
  { name: 'Verizon' },
  { name: 'AT&T', logoOverride: 'https://i.pinimg.com/280x280_RS/61/92/42/61924248467bfcc7c6deb931372c475e.jpg' },
  { name: 'Nike' },
  { name: 'Toyota' },
  { name: 'Samsung' },
  { name: 'ASML' },
  { name: 'Nestlé', logoOverride: 'https://thediylighthouse.com/wp-content/uploads/2018/01/Brand-Logo-Nestle.png' },
  { name: 'L\'Oréal', logoOverride: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8FceHy5907276w8XDskf1ivTOsE9bYOd2s-rI7rwbBMw9zdic4W-vSu3xjNJc5X324lQ&usqp=CAU' },
  { name: 'TSMC' },
  { name: 'Alibaba' },
  { name: 'Tencent' },
  { name: 'Kweichow Moutai', logoOverride: 'https://companieslogo.com/img/orig/600519.SS-44f59cd2.png?t=1720244490' },
  { name: 'Broadcom' },
  { name: 'Eli Lilly', logoOverride: 'https://pbs.twimg.com/profile_images/1542612027142717442/q2BxTXTj_200x200.png' },
  { name: 'LVMH' },
  { name: 'Novo Nordisk' },
  { name: 'Exxon Mobil' },
  { name: 'Unilever' },
  { name: 'Nissan', logoOverride: 'https://cdn.brandfetch.io/idXrbmGXhc/w/960/h/960/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1750108998315' }
];

const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const findBestMatch = (searchTerm, auditedCompanies) => {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  const exactMatch = auditedCompanies.find(company => company.toLowerCase() === normalizedSearch);
  if (exactMatch) return exactMatch;
  const containsMatch = auditedCompanies.find(company => company.toLowerCase().includes(normalizedSearch) || normalizedSearch.includes(company.toLowerCase()));
  if (containsMatch) return containsMatch;
  return null; // Simplified for ticker - primary match is what matters
};

let auditedCompaniesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

const BrandItem = ({ name, logoOverride, onAudit }) => {
  const domain = name.toLowerCase().replace(/\s+/g, '').replace(/&/g, 'and') + '.com';
  const logoUrl = logoOverride || `https://logo.clearbit.com/${domain}`;

  return (
    <div
      onClick={() => onAudit(name)}
      className="flex items-center gap-2 mx-4 py-2 cursor-pointer group"
    >
      <div className="w-6 h-6 bg-white/90 rounded-md flex items-center justify-center p-0.5 shadow">
        <img src={logoUrl} alt={name} className="w-full h-full object-contain" onError={(e) => e.target.style.opacity = 0.5} />
      </div>
      <span className="text-white text-sm font-medium whitespace-nowrap group-hover:underline">{name}</span>
    </div>
  );
};

export default function BrandTicker() {
  const [brands, setBrands] = useState([]);
  const [auditedCompanies, setAuditedCompanies] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [companyToAudit, setCompanyToAudit] = useState(null);

  useEffect(() => {
    const shuffled = shuffleArray([...allBrands]);
    setBrands([...shuffled, ...shuffled]);

    const loadAuditedCompanies = async () => {
      if (auditedCompaniesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        setAuditedCompanies(auditedCompaniesCache);
        return;
      }
      try {
        const audits = await BrandAudit.list();
        const uniqueCompanies = [...new Set(audits.map(audit => audit.company_name))];
        auditedCompaniesCache = uniqueCompanies;
        cacheTimestamp = Date.now();
        setAuditedCompanies(uniqueCompanies);
      } catch (error) {
        if (error.message.includes('429')) {
          console.warn("Rate limit hit while warming up ticker cache. Will try again later.");
        } else {
          console.error("Error loading audited companies in Ticker:", error);
        }
      }
    };
    loadAuditedCompanies();
  }, []);

  const handleAudit = (name) => {
    setCompanyToAudit(name);
    if (!isAuthenticated && !isLoading) {
      setShowLoginModal(true);
      return;
    }
    
    const bestMatch = findBestMatch(name, auditedCompanies);
    const finalCompanyName = bestMatch || name;
    navigate(createPageUrl("Results") + `?company=${encodeURIComponent(finalCompanyName)}`);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if(companyToAudit) {
      const bestMatch = findBestMatch(companyToAudit, auditedCompanies);
      const finalCompanyName = bestMatch || companyToAudit;
      navigate(createPageUrl("Results") + `?company=${encodeURIComponent(finalCompanyName)}`);
    }
  };

  return (
    <div className="bg-[#287de0] w-full overflow-hidden">
      <div className="relative h-12 flex items-center">
        <motion.div
          className="flex"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ ease: 'linear', duration: 60, repeat: Infinity }}
        >
          {brands.map((brand, index) => (
            <BrandItem key={`${brand.name}-${index}`} name={brand.name} logoOverride={brand.logoOverride} onAudit={handleAudit} />
          ))}
        </motion.div>
      </div>
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginSuccess}
      />
    </div>
  );
}