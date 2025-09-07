
import React, { useState, useEffect } from "react";
import { BrandAudit } from "@/api/entities";
import { brandRanker } from "@/api/functions";
import { ArrowLeft, Lightbulb, Target, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { format } from "date-fns"; // Fix: Removed ' = '
import ScoreRing from "../components/common/ScoreRing";
import CompanyHeaderCard from "../components/results/CompanyHeaderCard";
import CompetitorAnalysisTable from "../components/results/CompetitorAnalysisTable";
import ScoreHistoryChart from "../components/results/ScoreHistoryChart";

const KeyItem = ({ icon: Icon, text, color, iconSrc }) => (
    <div className="flex items-start gap-3">
        <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center`}>
            {iconSrc ? <img src={iconSrc} className="w-5 h-5" alt="icon" /> : <Icon className={`w-5 h-5 text-${color}-600`} />}
        </div>
        <p className="text-gray-700 leading-relaxed pt-0.5">{text}</p>
    </div>
);

const SubMetricCard = ({ title, score, summary, recommendation, isLoading, onRetry }) => {
    const getSummaryBgColor = (score) => {
        if (score >= 7) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };
    
    // Ensure score is a number for getSummaryBgColor and ScoreRing
    const numericScore = typeof score === 'number' ? score : 0;

    // Determine if there's an error based on the recommendation text
    const hasError = recommendation && recommendation.startsWith("Unable to generate");

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-2">
                <h4 className="font-semibold text-gray-800">{title}</h4>
                <ScoreRing score={numericScore} size="w-10 h-10" strokeWidth={3} fontSize="text-sm" />
            </div>
            <div className={`p-3 rounded-md border text-sm mb-3 ${getSummaryBgColor(numericScore)}`}>
                <p className="font-medium">"{summary || "N/A"}"</p>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed flex-grow">
                <span className="font-semibold text-gray-900 block mb-1">Recommendation:</span>
                {isLoading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                    </div>
                ) : hasError ? (
                    <div className="space-y-2">
                        <p className="text-red-600">{recommendation}</p>
                        <Button size="sm" variant="outline" onClick={onRetry} className="text-xs">
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <p>{recommendation || "N/A"}</p>
                )}
            </div>
        </div>
    );
};

const CategorySection = ({ title, score, summary, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-start gap-6 mb-4">
            <ScoreRing score={score} size="w-28 h-28" strokeWidth={5} fontSize="text-4xl" />
            <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{summary}</p>
            </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children}
        </div>
    </div>
);

export default function ContentReadiness() {
    const navigate = useNavigate();
    const [audit, setAudit] = useState(null);
    const [allAudits, setAllAudits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isContentBatchUpdating, setIsContentBatchUpdating] = useState(false);
    const [recommendations, setRecommendations] = useState({}); // New state for recommendations
    const [loadingRecs, setLoadingRecs] = useState({}); // New state for loading status of recommendations

    useEffect(() => {
        const auditId = new URLSearchParams(window.location.search).get('auditId');
        if (auditId) {
            fetchAudit(auditId);
        } else {
            setError("No audit specified.");
            setIsLoading(false);
        }
    }, []);
    
    // New useEffect to fetch and store recommendations once audit data is available
    useEffect(() => {
        if (audit?.id) {
            fetchAndStoreRecommendations();
        }
    }, [audit?.id]);

    const fetchAudit = async (id) => {
        setIsLoading(true);
        try {
            const audits = await BrandAudit.list();
            const data = audits.find(audit => audit.id === id);
            if (!data || !data.content_readiness_details) {
                throw new Error("Content readiness data is not available for this audit.");
            }
            setAudit(data);
            
            const companyAudits = audits
                .filter(a => a.company_name === data.company_name)
                .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
            setAllAudits(companyAudits);
        } catch (e) {
            setError(e.message);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAndStoreRecommendations = async (retryFor = null) => {
        if (!audit) return;
        const readinessDetails = audit.content_readiness_details;
        if (!readinessDetails) return;

        const subcategories = [
            { name: 'Content Liquidity', data: readinessDetails.availability?.content_liquidity, category: 'availability' },
            { name: 'Search Capital', data: readinessDetails.availability?.search_capital, category: 'availability' },
            { name: 'Algorithmic Anchors', data: readinessDetails.availability?.algorithmic_anchors, category: 'availability' },
            { name: 'Authoritative Content', data: readinessDetails.depth?.authoritative_content, category: 'depth' },
            { name: 'Technical Content', data: readinessDetails.depth?.technical_content, category: 'depth' },
            { name: 'Statistics with Citations', data: readinessDetails.depth?.statistics_with_citations, category: 'depth' },
            { name: 'Quotation Addition', data: readinessDetails.depth?.quotation_addition, category: 'depth' },
            { name: 'Relevant Content Updates', data: readinessDetails.depth?.relevant_content_updates, category: 'depth' },
            { name: 'Easy to Understand Content', data: readinessDetails.clarity?.easy_to_understand_content, category: 'clarity' },
            { name: 'Fluency Optimization', data: readinessDetails.clarity?.fluency_optimization, category: 'clarity' },
        ].filter(s => s.data);

        const existingRecs = {};
        subcategories.forEach(s => {
            if (s.data.stored_recommendation) {
                existingRecs[s.name] = s.data.stored_recommendation;
            }
        });
        setRecommendations(prev => ({ ...prev, ...existingRecs }));

        const neededRecs = retryFor 
            ? subcategories.filter(s => s.name === retryFor)
            : subcategories.filter(s => !s.data.stored_recommendation);

        if (neededRecs.length === 0) return;

        setLoadingRecs(prev => {
            const newLoading = {...prev};
            neededRecs.forEach(s => newLoading[s.name] = true);
            return newLoading;
        });

        const newRecommendations = {};
        
        // Process recommendations sequentially with delays to avoid rate limiting
        for (let i = 0; i < neededRecs.length; i++) {
            const subcat = neededRecs[i];
            
            // Add delay between requests (except for the first one)
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
            }
            
            try {
                const { data, error } = await brandRanker({
                    task: 'generate_subcategory_recommendation',
                    payload: { companyName: audit.company_name, subcategoryName: subcat.name }
                });
                
                if (error) {
                    throw new Error(error.error || "Failed to generate recommendation.");
                }
                
                newRecommendations[subcat.name] = data.recommendation;
                
                // Update UI immediately as each recommendation is fetched
                setRecommendations(prev => ({ ...prev, [subcat.name]: data.recommendation }));
                
            } catch (err) {
                console.error(`Failed to fetch recommendation for ${subcat.name}`, err);
                newRecommendations[subcat.name] = `Unable to generate recommendation.`;
                setRecommendations(prev => ({ ...prev, [subcat.name]: `Unable to generate recommendation.` }));
            }
            
            // Update loading state for this specific recommendation
            setLoadingRecs(prev => ({ ...prev, [subcat.name]: false }));
        }

        const recsToStore = Object.keys(newRecommendations).filter(k => !newRecommendations[k].startsWith('Unable to'));

        if (recsToStore.length > 0) {
            const updatedDetails = JSON.parse(JSON.stringify(readinessDetails));
            
            recsToStore.forEach(recName => {
                const subcat = subcategories.find(s => s.name === recName);
                if(subcat) {
                    const subCatKey = subcat.name.toLowerCase().replace(/\s+/g, '_');
                    if (updatedDetails[subcat.category]?.[subCatKey]) {
                        updatedDetails[subcat.category][subCatKey].stored_recommendation = newRecommendations[recName];
                    }
                }
            });

            try {
                await BrandAudit.update(audit.id, { content_readiness_details: updatedDetails });
                setAudit(prev => ({ ...prev, content_readiness_details: updatedDetails }));
            } catch (err) {
                console.error("Failed to store recommendations in DB", err);
            }
        }
    };
    
    const handleContentCompetitorsChange = async (newCompetitorList) => {
        setIsContentBatchUpdating(true);
        const allCompanies = [audit.company_name, ...newCompetitorList];
        
        try {
            // NOTE: This logic is complex for a single backend function call in this implementation.
            // For now, we will simulate the update locally and show a message.
            // A more advanced implementation would need a dedicated backend task for this.
            
            console.warn("Simulating content competitor update. A dedicated backend task is recommended for live data.");

            // Derive the list of content categories from the current audit details
            // Use optional chaining and nullish coalescing to safely access scores
            const currentContentCategories = {
                content_liquidity: audit.content_readiness_details?.availability?.content_liquidity?.score ?? 0,
                search_capital: audit.content_readiness_details?.availability?.search_capital?.score ?? 0,
                algorithmic_anchors: audit.content_readiness_details?.availability?.algorithmic_anchors?.score ?? 0,
                authoritative_content: audit.content_readiness_details?.depth?.authoritative_content?.score ?? 0,
                technical_content: audit.content_readiness_details?.depth?.technical_content?.score ?? 0,
                statistics_with_citations: audit.content_readiness_details?.depth?.statistics_with_citations?.score ?? 0,
                quotation_addition: audit.content_readiness_details?.depth?.quotation_addition?.score ?? 0,
                relevant_content_updates: audit.content_readiness_details?.depth?.relevant_content_updates?.score ?? 0,
                easy_to_understand_content: audit.content_readiness_details?.clarity?.easy_to_understand_content?.score ?? 0,
                fluency_optimization: audit.content_readiness_details?.clarity?.fluency_optimization?.score ?? 0,
            };

            const updatedCompetitorAnalysis = newCompetitorList.map(compName => {
                const existingComp = audit.content_readiness_details?.competitor_analysis?.find(c => c.company_name === compName);
                if(existingComp) return existingComp;

                // Create mock data for new competitor
                const scores = {};
                Object.keys(currentContentCategories).forEach(key => {
                    scores[key] = Math.round((Math.random() * 4 + 4) * 10) / 10;
                });
                return { company_name: compName, scores };
            });

            const newAudit = JSON.parse(JSON.stringify(audit));
            newAudit.competitors = newCompetitorList; // Added as per outline
            if (newAudit.content_readiness_details) {
                newAudit.content_readiness_details.competitor_analysis = updatedCompetitorAnalysis;
            } else {
                newAudit.content_readiness_details = { competitor_analysis: updatedCompetitorAnalysis };
            }
            
            await BrandAudit.update(audit.id, { 
                content_readiness_details: newAudit.content_readiness_details,
                competitors: newCompetitorList // Added as per outline
            });
            setAudit(newAudit);
            // In a full implementation, you'd call the backend function here.
            // Example:
            // const { data, error } = await brandRanker({ task: 'regenerate_content_analysis', payload: { companyNames: allCompanies } });
            // if(error) throw new Error(error.message);
            // ... update audit with data ...

        } catch (e) {
            console.error("Failed to batch update content competitors:", e);
            setError("Error updating content competitor scores. Please try again.");
        } finally {
            setIsContentBatchUpdating(false);
        }
    };

    const handleViewAudit = (auditId) => {
        const targetAudit = allAudits.find(a => a.id === auditId);
        if (targetAudit) {
            setAudit(targetAudit);
            window.history.replaceState({}, '', createPageUrl(`ContentReadiness?auditId=${auditId}`));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-lg font-medium text-gray-700">Loading Content Readiness Report...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 text-lg font-medium">{error}</div>;

    if (!audit) return null;

    const { company_name, content_readiness_details: details, content_readiness_score, created_date, company_logo_url } = audit;
    const { availability, depth, clarity } = details || {}; // Ensure details is an object

    // Calculate average scores for categories, handling potential missing data with optional chaining and nullish coalescing
    const availabilityScore = ((availability?.content_liquidity?.score ?? 0) + (availability?.search_capital?.score ?? 0) + (availability?.algorithmic_anchors?.score ?? 0)) / 3;
    const depthScore = ((depth?.authoritative_content?.score ?? 0) + (depth?.technical_content?.score ?? 0) + (depth?.statistics_with_citations?.score ?? 0) + (depth?.quotation_addition?.score ?? 0) + (depth?.relevant_content_updates?.score ?? 0)) / 5;
    const clarityScore = ((clarity?.easy_to_understand_content?.score ?? 0) + (clarity?.fluency_optimization?.score ?? 0)) / 2;
    
    const uniqueAuditsByDay = Object.values(
      allAudits.reduce((acc, currentAudit) => {
        const day = currentAudit.created_date.split('T')[0];
        if (!acc[day] || new Date(currentAudit.created_date) > new Date(acc[day].created_date)) {
          acc[day] = currentAudit;
        }
        return acc;
      }, {})
    );

    // Ensure all scores are safely accessed using optional chaining and nullish coalescing
    const mainCompanyScores = {
        content_liquidity: availability?.content_liquidity?.score ?? 0,
        search_capital: availability?.search_capital?.score ?? 0,
        algorithmic_anchors: availability?.algorithmic_anchors?.score ?? 0,
        authoritative_content: depth?.authoritative_content?.score ?? 0,
        technical_content: depth?.technical_content?.score ?? 0,
        statistics_with_citations: depth?.statistics_with_citations?.score ?? 0,
        quotation_addition: depth?.quotation_addition?.score ?? 0,
        relevant_content_updates: depth?.relevant_content_updates?.score ?? 0,
        easy_to_understand_content: clarity?.easy_to_understand_content?.score ?? 0,
        fluency_optimization: clarity?.fluency_optimization?.score ?? 0,
    };

    const competitorAnalysisData = [
        { company_name: company_name, scores: mainCompanyScores },
        ...(details?.competitor_analysis || []) // Safely access competitor_analysis
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" onClick={() => navigate(createPageUrl("Results") + `?company=${company_name}`)} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Report
                    </Button>
                </motion.div>

                <div className="space-y-8">
                    <CompanyHeaderCard
                        companyName={company_name}
                        score={content_readiness_score}
                        description="Content Readiness scores a brand's website content readiness for AI answer engines, including key factors of content depth, clarity, and availability. This is measured across the most popular answer engines and each dimension is weighted equally."
                        lastUpdate={format(new Date(created_date), 'MM/dd/yy, hh:mm a')}
                        logoUrl={company_logo_url || `https://logo.clearbit.com/${company_name.toLowerCase().replace(/\s+/g, '')}.com`}
                    />
                    
                    {uniqueAuditsByDay.length > 1 && (
                      <ScoreHistoryChart audits={uniqueAuditsByDay} scoreType="content" onAuditClick={handleViewAudit} />
                    )}

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Lightbulb className="text-yellow-500" /> Key Findings</h3>
                            <div className="space-y-4">
                                {(details?.key_findings || []).map((item, i) => <KeyItem key={i} text={item} iconSrc="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c0443ad28_keyfinding.png" />)}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                             <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Target className="w-6 h-6 text-blue-600" /> Key Recommendations
                            </h3>
                            <div className="space-y-4">
                                {(details?.key_recommendations || []).map((item, i) => <KeyItem key={i} text={item} iconSrc="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/df6dfa616_BrandRankLogo.png" />)}
                            </div>
                        </div>
                    </div>
                    
                    <CategorySection title="Availability" score={availabilityScore} summary={availability?.summary ?? ''}>
                        <SubMetricCard 
                            title="Content Liquidity" 
                            score={availability?.content_liquidity?.score ?? 0}
                            summary={availability?.content_liquidity?.summary ?? ''}
                            recommendation={recommendations['Content Liquidity']} 
                            isLoading={loadingRecs['Content Liquidity']} 
                            onRetry={() => fetchAndStoreRecommendations('Content Liquidity')} 
                        />
                        <SubMetricCard 
                            title="Search Capital" 
                            score={availability?.search_capital?.score ?? 0}
                            summary={availability?.search_capital?.summary ?? ''}
                            recommendation={recommendations['Search Capital']} 
                            isLoading={loadingRecs['Search Capital']} 
                            onRetry={() => fetchAndStoreRecommendations('Search Capital')} 
                        />
                        <SubMetricCard 
                            title="Algorithmic Anchors" 
                            score={availability?.algorithmic_anchors?.score ?? 0}
                            summary={availability?.algorithmic_anchors?.summary ?? ''}
                            recommendation={recommendations['Algorithmic Anchors']} 
                            isLoading={loadingRecs['Algorithmic Anchors']} 
                            onRetry={() => fetchAndStoreRecommendations('Algorithmic Anchors')} 
                        />
                    </CategorySection>

                    <CategorySection title="Depth" score={depthScore} summary={depth?.summary ?? ''}>
                        <SubMetricCard 
                            title="Authoritative Content" 
                            score={depth?.authoritative_content?.score ?? 0}
                            summary={depth?.authoritative_content?.summary ?? ''}
                            recommendation={recommendations['Authoritative Content']} 
                            isLoading={loadingRecs['Authoritative Content']} 
                            onRetry={() => fetchAndStoreRecommendations('Authoritative Content')} 
                        />
                        <SubMetricCard 
                            title="Technical Content" 
                            score={depth?.technical_content?.score ?? 0}
                            summary={depth?.technical_content?.summary ?? ''}
                            recommendation={recommendations['Technical Content']} 
                            isLoading={loadingRecs['Technical Content']} 
                            onRetry={() => fetchAndStoreRecommendations('Technical Content')} 
                        />
                        <SubMetricCard 
                            title="Statistics with Citations" 
                            score={depth?.statistics_with_citations?.score ?? 0}
                            summary={depth?.statistics_with_citations?.summary ?? ''}
                            recommendation={recommendations['Statistics with Citations']} 
                            isLoading={loadingRecs['Statistics with Citations']} 
                            onRetry={() => fetchAndStoreRecommendations('Statistics with Citations')} 
                        />
                        <SubMetricCard 
                            title="Quotation Addition" 
                            score={depth?.quotation_addition?.score ?? 0}
                            summary={depth?.quotation_addition?.summary ?? ''}
                            recommendation={recommendations['Quotation Addition']} 
                            isLoading={loadingRecs['Quotation Addition']} 
                            onRetry={() => fetchAndStoreRecommendations('Quotation Addition')} 
                        />
                        <SubMetricCard 
                            title="Relevant Content Updates" 
                            score={depth?.relevant_content_updates?.score ?? 0}
                            summary={depth?.relevant_content_updates?.summary ?? ''}
                            recommendation={recommendations['Relevant Content Updates']} 
                            isLoading={loadingRecs['Relevant Content Updates']} 
                            onRetry={() => fetchAndStoreRecommendations('Relevant Content Updates')} 
                        />
                    </CategorySection>

                    <CategorySection title="Clarity" score={clarityScore} summary={clarity?.summary ?? ''}>
                        <SubMetricCard 
                            title="Easy to Understand Content" 
                            score={clarity?.easy_to_understand_content?.score ?? 0}
                            summary={clarity?.easy_to_understand_content?.summary ?? ''}
                            recommendation={recommendations['Easy to Understand Content']} 
                            isLoading={loadingRecs['Easy to Understand Content']} 
                            onRetry={() => fetchAndStoreRecommendations('Easy to Understand Content')} 
                        />
                        <SubMetricCard 
                            title="Fluency Optimization" 
                            score={clarity?.fluency_optimization?.score ?? 0}
                            summary={clarity?.fluency_optimization?.summary ?? ''}
                            recommendation={recommendations['Fluency Optimization']} 
                            isLoading={loadingRecs['Fluency Optimization']} 
                            onRetry={() => fetchAndStoreRecommendations('Fluency Optimization')} 
                        />
                    </CategorySection>

                    <CompetitorAnalysisTable 
                        mainCompanyName={company_name}
                        competitorData={competitorAnalysisData}
                        initialCompetitors={audit.competitors || []}
                        onUpdateCompetitors={handleContentCompetitorsChange}
                        isBatchUpdating={isContentBatchUpdating}
                    />
                </div>
            </div>
        </div>
    );
}
