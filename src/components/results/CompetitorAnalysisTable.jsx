
import React from 'react';
import { motion } from 'framer-motion';
import CompetitorSelector from './CompetitorSelector';
import ScoreRing from '../common/ScoreRing'; // Import the ScoreRing component

const subcategoryMap = {
  content_liquidity: 'Content Liquidity',
  search_capital: 'Search Capital',
  algorithmic_anchors: 'Algorithmic Anchors',
  authoritative_content: 'Authoritative Content',
  technical_content: 'Technical Content',
  statistics_with_citations: 'Statistics with Citations',
  quotation_addition: 'Quotation Addition',
  relevant_content_updates: 'Relevant Content Updates',
  easy_to_understand_content: 'Easy to Understand Content',
  fluency_optimization: 'Fluency Optimization'
};

const getRowBackgroundColor = (auditedCompanyScore, competitorScores) => {
  if (competitorScores.length === 0) return 'bg-white';
  
  const averageCompetitorScore = competitorScores.reduce((sum, score) => sum + score, 0) / competitorScores.length;
  
  if (auditedCompanyScore > averageCompetitorScore) {
    return 'bg-green-50'; // Light green for overperforming
  } else if (auditedCompanyScore < averageCompetitorScore) {
    return 'bg-red-50'; // Light red for underperforming
  }
  
  return 'bg-white'; // Default white for equal performance
};

// Add the logo overrides for consistency
const logoOverrides = {
    'McDonald\'s': 'https://i.pinimg.com/736x/eb/70/22/eb7022d9db13ba43cdf5507dabf4cd4a.jpg',
    'L\'Oréal': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8FceHy5907276w8XDskf1ivTOsE9bYOd2s-rI7rwbBMw9zdic4W-vSu3xjNJc5X324lQ&usqp=CAU',
    'Eli Lilly': 'https://pbs.twimg.com/profile_images/1542612027142717442/q2BxTXTj_200x200.png',
    'Nissan': 'https://cdn.brandfetch.io/idXrbmGXhc/w/960/h/960/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1750108998315',
    'AT&T': 'https://i.pinimg.com/280x280_RS/61/92/42/61924248467bfcc7c6deb931372c475e.jpg',
    'UnitedHealth': 'https://play-lh.googleusercontent.com/wbBhGUZBcwxy6iUp1wWoJM6PC29lL4oHMvOVeAviVdm9Bpd_i3slI9JiOpjnfhChUJI',
    'Bank of America': 'https://icons.veryicon.com/png/o/business/bank-logo-collection/bank-of-america-logo.png',
    'Johnson & Johnson': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2wSP9KyRWVtSYRd_GjuL9ss9tY6Nsi3-Lkg&s',
    'Nestlé': 'https://thediylighthouse.com/wp-content/uploads/2018/01/Brand-Logo-Nestle.png',
    'Kweichow Moutai': 'https://companieslogo.com/img/orig/600519.SS-44f59cd2.png?t=1720244490'
};

const getLogoUrl = (companyName) => {
    return logoOverrides[companyName] || `https://logo.clearbit.com/${companyName.toLowerCase().replace(/\s+/g, '').replace(/&/g, 'and')}.com`;
};

export default function CompetitorAnalysisTable({ 
  mainCompanyName, 
  competitorData, 
  initialCompetitors, 
  onUpdateCompetitors, 
  isBatchUpdating 
}) {
  const mainCompanyRecord = competitorData.find(c => c.company_name === mainCompanyName);
  const competitorAnalysis = competitorData.filter(c => c.company_name !== mainCompanyName);

  if (!mainCompanyRecord) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Competitor Content Analysis</h2>
        <p className="text-gray-600">Loading analysis data...</p>
      </div>
    );
  }

  const auditedCompanyScores = mainCompanyRecord.scores;
  const auditedCompany = mainCompanyName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Competitor Content Analysis
      </h2>
      <p className="text-gray-600 mb-6">Compare your content scores against key competitors. You can add or remove competitors to update the analysis.</p>
      
      <div className="mb-6">
        <CompetitorSelector 
            competitors={initialCompetitors} 
            setCompetitors={onUpdateCompetitors} 
            isUpdating={isBatchUpdating}
        />
      </div>
      
      {competitorAnalysis.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Add competitors above to see a detailed comparison.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 align-bottom">Metric</th>
                <th className="text-center py-3 px-4">
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={getLogoUrl(auditedCompany)} 
                      alt={`${auditedCompany} logo`} 
                      className="w-10 h-10 object-contain"
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auditedCompany)}&background=e5e7eb&color=4b5563&size=64&format=png`; }}
                    />
                    <span className="font-semibold text-[#287de0]">{auditedCompany}</span>
                  </div>
                </th>
                {competitorAnalysis.map((competitor, index) => (
                  <th key={index} className="text-center py-3 px-4">
                    <div className="flex flex-col items-center gap-2">
                      <img 
                        src={getLogoUrl(competitor.company_name)} 
                        alt={`${competitor.company_name} logo`} 
                        className="w-10 h-10 object-contain"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.company_name)}&background=e5e7eb&color=4b5563&size=64&format=png`; }}
                      />
                      <span className="font-semibold text-gray-700">{competitor.company_name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(subcategoryMap).map(([key, displayName]) => {
                const auditedScore = auditedCompanyScores[key] || 0;
                const competitorScores = competitorAnalysis.map(comp => comp.scores?.[key] || 0);
                const rowBgColor = getRowBackgroundColor(auditedScore, competitorScores);
                
                return (
                  <tr key={key} className={`border-b border-gray-100 ${rowBgColor} transition-colors duration-300`}>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {displayName}
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <ScoreRing score={auditedScore} size="w-12 h-12" strokeWidth={3} fontSize="text-base" />
                      </div>
                    </td>
                    {competitorAnalysis.map((competitor, index) => {
                      const score = competitor.scores?.[key] || 0;
                      return (
                        <td key={index} className="text-center py-4 px-4">
                          <div className="flex justify-center">
                            <ScoreRing score={score} size="w-12 h-12" strokeWidth={3} fontSize="text-base" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
          <span className="text-gray-600">Outperforming competitors</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
          <span className="text-gray-600">Underperforming vs competitors</span>
        </div>
      </div>
    </motion.div>
  );
}
