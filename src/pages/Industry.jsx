
import React, { useState, useEffect, useMemo } from "react";
import { BrandAudit } from "@/api/entities";
import { brandRanker } from "@/api/functions";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import ScoreRing from "../components/common/ScoreRing";
import { 
    Layers, 
    Laptop, 
    Car, 
    Utensils, 
    HeartHandshake, 
    GraduationCap, 
    Building2, 
    Pill, 
    Palette, 
    Zap, 
    ShoppingCart, 
    Factory, 
    Briefcase, 
    Users, 
    Globe, 
    TrendingUp,
    Wrench,
    Home,
    Gamepad2,
    Plane,
    Store,
    Shirt, // Added Shirt icon
    GlassWater // Added GlassWater icon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Industry icon mapping
const industryIcons = {
    'Technology': Laptop,
    'Automotive': Car,
    'Quick-Service Restaurants': Utensils,
    'Food & Beverage': Utensils,
    'Restaurant': Utensils,
    'Beverages': GlassWater, // Added Beverages icon
    'Healthcare': HeartHandshake,
    'Health': HeartHandshake,
    'Pharmaceutical': Pill,
    'Learning': GraduationCap,
    'Education': GraduationCap,
    'Financial Services': Building2,
    'Banking': Building2,
    'Finance': Building2,
    'Beauty': Palette,
    'Cosmetics': Palette,
    'Apparel': Shirt, // Added Apparel icon
    'Footwear': Shirt, // Added Footwear icon
    'Energy': Zap,
    'Retail': ShoppingCart,
    'E-commerce': ShoppingCart,
    'Manufacturing': Factory,
    'Business': Briefcase,
    'Consulting': Users,
    'Telecommunications': Globe,
    'Media': TrendingUp,
    'Entertainment': Gamepad2,
    'Industrial': Wrench,
    'Real Estate': Home,
    'Travel': Plane,
    'Hospitality': Store,
    'General': Layers  // Default fallback
};

// Function to get the most appropriate icon for an industry
const getIndustryIcon = (industryName) => {
    // Direct match
    if (industryIcons[industryName]) {
        return industryIcons[industryName];
    }
    
    // Fuzzy matching for common variations
    const lowerIndustry = industryName.toLowerCase();
    
    if (lowerIndustry.includes('tech') || lowerIndustry.includes('software') || lowerIndustry.includes('internet')) {
        return industryIcons['Technology'];
    }
    if (lowerIndustry.includes('auto') || lowerIndustry.includes('car')) {
        return industryIcons['Automotive'];
    }
    if (lowerIndustry.includes('food') || lowerIndustry.includes('restaurant') || lowerIndustry.includes('dining')) {
        return industryIcons['Food & Beverage'];
    }
    if (lowerIndustry.includes('beverage')) { // Added fuzzy match for beverage
        return industryIcons['Beverages'];
    }
    if (lowerIndustry.includes('health') || lowerIndustry.includes('medical') || lowerIndustry.includes('pharma')) {
        return industryIcons['Healthcare'];
    }
    if (lowerIndustry.includes('finance') || lowerIndustry.includes('bank') || lowerIndustry.includes('investment')) {
        return industryIcons['Financial Services'];
    }
    if (lowerIndustry.includes('beauty') || lowerIndustry.includes('cosmetic') || lowerIndustry.includes('personal care')) {
        return industryIcons['Beauty'];
    }
    if (lowerIndustry.includes('apparel') || lowerIndustry.includes('footwear') || lowerIndustry.includes('fashion') || lowerIndustry.includes('clothing')) { // Added fuzzy match for apparel/footwear
        return industryIcons['Apparel'];
    }
    if (lowerIndustry.includes('retail') || lowerIndustry.includes('shopping') || lowerIndustry.includes('commerce')) {
        return industryIcons['Retail'];
    }
    if (lowerIndustry.includes('energy') || lowerIndustry.includes('oil') || lowerIndustry.includes('gas')) {
        return industryIcons['Energy'];
    }
    if (lowerIndustry.includes('telecom') || lowerIndustry.includes('communication') || lowerIndustry.includes('wireless')) {
        return industryIcons['Telecommunications'];
    }
    if (lowerIndustry.includes('media') || lowerIndustry.includes('entertainment') || lowerIndustry.includes('streaming')) {
        return industryIcons['Media'];
    }
    if (lowerIndustry.includes('travel') || lowerIndustry.includes('airline') || lowerIndustry.includes('tourism')) {
        return industryIcons['Travel'];
    }
    if (lowerIndustry.includes('real estate') || lowerIndustry.includes('property') || lowerIndustry.includes('housing')) {
        return industryIcons['Real Estate'];
    }
    if (lowerIndustry.includes('education') || lowerIndustry.includes('learning') || lowerIndustry.includes('university')) {
        return industryIcons['Education'];
    }
    if (lowerIndustry.includes('manufacturing') || lowerIndustry.includes('industrial') || lowerIndustry.includes('factory')) {
        return industryIcons['Manufacturing'];
    }
    
    // Default fallback
    return industryIcons['General'];
};

// Component for a single company row
const CompanyRow = ({ rank, company }) => {
    const logoUrl = `https://logo.clearbit.com/${company.company_name.toLowerCase().replace(/\s+/g, '')}.com`;
    const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.company_name)}&background=e5e7eb&color=4b5563&size=64&format=png`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-3 border-b border-gray-100 last:border-b-0"
        >
            <div className="w-8 text-xl font-bold text-gray-400 text-center flex-shrink-0">{rank}</div>
            <img src={logoUrl} onError={(e) => { e.target.src = fallbackLogo; }} alt={company.company_name} className="w-10 h-10 object-contain rounded-md" />
            <div className="flex-grow">
                <p className="font-semibold text-gray-900">{company.company_name}</p>
                <p className="text-xs text-gray-500">
                    Last audited: {formatDistanceToNow(new Date(company.created_date), { addSuffix: true })}
                </p>
            </div>
            <ScoreRing score={company.overall_score} size="w-14 h-14" strokeWidth={4} fontSize="text-lg" />
        </motion.div>
    );
};

// Main page component
export default function IndustryPage() {
    const [latestAudits, setLatestAudits] = useState([]);
    const [companyIndustries, setCompanyIndustries] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [processingMessage, setProcessingMessage] = useState("Fetching latest audit data...");

    useEffect(() => {
        const loadAndProcessAudits = async () => {
            try {
                const allAudits = await BrandAudit.list("-created_date");
                if (allAudits.length === 0) {
                    setIsLoading(false);
                    setProcessingMessage("No audits found.");
                    return;
                }

                // Normalize company names and get only the latest audit for each unique company
                const normalizeCompanyName = (name) => name.toLowerCase().trim().replace(/\s+/g, ' ');
                
                const uniqueCompanyAudits = Object.values(allAudits.reduce((acc, audit) => {
                    const normalizedName = normalizeCompanyName(audit.company_name);
                    if (!acc[normalizedName] || new Date(audit.created_date) > new Date(acc[normalizedName].created_date)) {
                        acc[normalizedName] = audit;
                    }
                    return acc;
                }, {}));
                
                setLatestAudits(uniqueCompanyAudits);
                
                // Fetch industries for each company sequentially to avoid rate-limiting
                setProcessingMessage(`Categorizing ${uniqueCompanyAudits.length} companies...`);
                const companyNames = uniqueCompanyAudits.map(audit => audit.company_name);
                
                if (companyNames.length > 0) {
                    try {
                        const { data: industriesMap, error } = await brandRanker({
                            task: 'get_company_industries',
                            payload: { companyNames }
                        });

                        if (error) {
                            throw new Error(error.error || 'Batch industry fetch failed');
                        }

                        // Ensure industriesMap is an object and fill in 'General' for any missing ones
                        const finalIndustriesMap = {};
                        companyNames.forEach(name => {
                            finalIndustriesMap[name] = industriesMap[name] || 'General';
                        });
                        setCompanyIndustries(finalIndustriesMap);

                    } catch (e) {
                        console.error(`Failed to get industries in batch:`, e);
                        // On batch failure, assign 'General' to all companies
                        const errorMap = {};
                        companyNames.forEach(name => { errorMap[name] = 'General'; });
                        setCompanyIndustries(errorMap);
                    }
                } else {
                    setCompanyIndustries({}); // No companies to process
                }
                
            } catch (error) {
                console.error("Error loading industry data:", error);
                setProcessingMessage("An error occurred while loading data.");
            } finally {
                setIsLoading(false);
                setProcessingMessage("");
            }
        };

        loadAndProcessAudits();
    }, []);

    const rankedIndustries = useMemo(() => {
        if (latestAudits.length === 0 || Object.keys(companyIndustries).length === 0) {
            return {};
        }

        const grouped = latestAudits.reduce((acc, audit) => {
            const industry = companyIndustries[audit.company_name] || 'General';
            if (!acc[industry]) {
                acc[industry] = [];
            }
            acc[industry].push(audit);
            return acc;
        }, {});

        // Sort companies within each industry
        Object.keys(grouped).forEach(industry => {
            grouped[industry].sort((a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0));
        });

        return grouped;
    }, [latestAudits, companyIndustries]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#287de0]/20 border-t-[#287de0] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">{processingMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        Industry Rankings
                    </h1>
                    <p className="text-gray-600">
                        Comparing the latest brand audit scores across different industries.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {Object.keys(rankedIndustries).sort().map((industry, index) => {
                        const IndustryIcon = getIndustryIcon(industry);
                        
                        return (
                            <motion.div
                                key={industry}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="h-full flex flex-col">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-xl font-bold text-[#287de0] flex items-center gap-2">
                                            <IndustryIcon className="w-6 h-6" />
                                            {industry}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-2 flex-grow">
                                        {rankedIndustries[industry].map((company, rankIndex) => (
                                            <CompanyRow key={company.id} rank={rankIndex + 1} company={company} />
                                        ))}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
