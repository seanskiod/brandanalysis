
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, BarChart3, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "../hooks/useAuth";
import LoginModal from "../auth/LoginModal";
import { BrandAudit } from "@/api/entities";

const brandExamples = [
  "Nike", "Apple", "Tesla", "Amazon", "Google", "Microsoft", "Coca-Cola", 
  "McDonald's", "Disney", "Netflix", "Samsung", "Intel", "Oracle", "Walmart"
];

// Smart matching function
const findBestMatch = (searchTerm, auditedCompanies) => {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  // First check exact matches (case insensitive)
  const exactMatch = auditedCompanies.find(company => 
    company.toLowerCase() === normalizedSearch
  );
  if (exactMatch) return exactMatch;
  
  // Check if search term is contained in any company name
  const containsMatch = auditedCompanies.find(company => 
    company.toLowerCase().includes(normalizedSearch) || 
    normalizedSearch.includes(company.toLowerCase())
  );
  if (containsMatch) return containsMatch;
  
  // Simple Levenshtein distance for typo tolerance
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };
  
  // Find closest match by edit distance (max 2 edits for typos)
  let bestMatch = null;
  let bestDistance = Infinity;
  
  auditedCompanies.forEach(company => {
    const distance = levenshteinDistance(normalizedSearch, company.toLowerCase());
    if (distance < bestDistance && distance <= 2) { // Max 2 edits to be considered a close match
      bestDistance = distance;
      bestMatch = company;
    }
  });
  
  return bestMatch;
};

export default function HeroSection() {
  const [companyName, setCompanyName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [auditedCompanies, setAuditedCompanies] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Effect for typing animation
  useEffect(() => {
    const currentBrand = brandExamples[currentBrandIndex];
    let timeout;

    if (isTyping) {
      // Typing animation
      if (placeholderText.length < currentBrand.length) {
        timeout = setTimeout(() => {
          setPlaceholderText(currentBrand.slice(0, placeholderText.length + 1));
        }, 100);
      } else {
        // Pause at full text before starting to delete
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause for 2 seconds
      }
    } else {
      // Deleting animation
      if (placeholderText.length > 0) {
        timeout = setTimeout(() => {
          setPlaceholderText(placeholderText.slice(0, -1));
        }, 50); // Faster deletion
      } else {
        // Move to next brand and start typing
        setCurrentBrandIndex((prev) => (prev + 1) % brandExamples.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [placeholderText, currentBrandIndex, isTyping]);

  // Effect to load previously audited companies for smart matching
  useEffect(() => {
    const loadAuditedCompanies = async () => {
      try {
        const audits = await BrandAudit.list();
        const uniqueCompanies = [...new Set(audits.map(audit => audit.company_name))];
        setAuditedCompanies(uniqueCompanies);
      } catch (error) {
        console.error("Error loading audited companies:", error);
        // Silently fail - smart matching will just use the original input
      }
    };
    
    loadAuditedCompanies();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    
    if (!isAuthenticated && !isLoading) {
      setShowLoginModal(true);
      return;
    }
    
    setIsSearching(true);
    
    // Apply smart matching
    const bestMatch = findBestMatch(companyName.trim(), auditedCompanies);
    const finalCompanyName = bestMatch || companyName.trim(); // Use bestMatch if found, otherwise original input
    
    // Navigate with the matched company name
    navigate(createPageUrl("Results") + `?company=${encodeURIComponent(finalCompanyName)}`);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (companyName.trim()) {
      setIsSearching(true);
      const bestMatch = findBestMatch(companyName.trim(), auditedCompanies);
      const finalCompanyName = bestMatch || companyName.trim();
      navigate(createPageUrl("Results") + `?company=${encodeURIComponent(finalCompanyName)}`);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gray-50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Discover Brand's
              <span className="text-[#287de0] block">AI Search Visibility</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Analyze how a brand performs on ChatGPT. Instantly assess visibility, 
              competitive positioning, and content readiness for your next big client meeting.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={`Audit... ${placeholderText}`}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-16 pl-6 pr-40 text-lg rounded-2xl border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#287de0] focus:ring-4 focus:ring-[#287de0]/10 shadow-lg transition-all duration-300"
                  disabled={isSearching}
                />
                <Button
                  type="submit"
                  disabled={!companyName.trim() || isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-12 px-6 bg-[#287de0] hover:bg-[#1e6bc7] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Analyze Brand
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
              <div className="w-12 h-12 bg-[#287de0]/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-[#287de0]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Overall Score</h3>
              <p className="text-gray-600 leading-relaxed">
                Composite performance score across all major AI answer engines, 
                indicating your brand's superiority in the answer economy.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
              <div className="w-12 h-12 bg-[#287de0]/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Eye className="w-6 h-6 text-[#287de0]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Visibility Score</h3>
              <p className="text-gray-600 leading-relaxed">
                Measures how frequently your brand appears in AI-generated responses 
                and your influence on consumer decision-making.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
              <div className="w-12 h-12 bg-[#287de0]/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="w-6 h-6 text-[#287de0]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Content Readiness</h3>
              <p className="text-gray-600 leading-relaxed">
                Evaluates your website's content depth, clarity, and optimization 
                for AI answer engines across multiple dimensions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginSuccess}
      />
    </div>
  );
}
