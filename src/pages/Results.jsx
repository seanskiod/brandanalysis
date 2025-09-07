
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BrandAudit } from "@/api/entities";
import { User } from "@/api/entities";
import { brandRanker } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Eye, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import OverallScoreCard from "../components/results/OverallScoreCard";
import ClickableScoreCard from "../components/results/ClickableScoreCard";
import ScoreHistoryChart from "../components/results/ScoreHistoryChart";
import AuditHistoryLog from "../components/results/AuditHistoryLog";
import LogoLoader from "../components/common/LogoLoader";
import PromptInputForm from "../components/results/PromptInputForm";

const loadingMessages = [
  'Initiating real-time search...',
  'Analyzing unbranded prompts...',
  'Evaluating competitor landscape...',
  'Compiling content readiness scores...',
  'Finalizing brand analysis...',
  'Almost there, generating report...'
];

export default function Results() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [auditData, setAuditData] = useState(null);
  const [allAudits, setAllAudits] = useState([]);
  const [currentAuditIndex, setCurrentAuditIndex] = useState(0);
  const [pageState, setPageState] = useState('initializing');
  const [loadingState, setLoadingState] = useState({ isLoading: true, progress: 0, message: 'Initiating audit...' });
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const company = urlParams.get('company');
    
    if (!company) {
      navigate(createPageUrl("Home"));
      return;
    }
    
    setCompanyName(company);
    loadExistingAudits(company);

    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
  }, []);

  const loadExistingAudits = async (company) => {
    setLoadingState({ isLoading: true, progress: 0, message: 'Checking for existing reports...' });
    setError(null);
    
    try {
      const audits = await BrandAudit.filter({ company_name: company }, '-created_date');
      setAllAudits(audits);
      
      if (audits.length > 0) {
        setAuditData(audits[0]);
        setCurrentAuditIndex(0);
        setPageState('dashboard');
        setLoadingState({ isLoading: false, progress: 100, message: 'Done' });
      } else {
        setPageState('promptInput');
        setLoadingState({ isLoading: false, progress: 0, message: '' });
      }
    } catch (err) {
      console.error("Error loading audits:", err);
      
      // Handle rate limiting gracefully
      if (err.message && err.message.includes('429')) {
        setError("Server is temporarily busy. Please wait a moment and try again.");
        setTimeout(() => {
          loadExistingAudits(company);
        }, 3000);
        return;
      }
      
      setError("Failed to load existing audits. Please provide prompts to generate a new one.");
      setPageState('promptInput');
    }
  };

  const generateAuditReport = async (company, auditInputs) => {
    // First, check if the user is authenticated
    try {
      await User.me();
    } catch (authError) {
      // If not authenticated, redirect to login and come back to this page
      await User.loginWithRedirect(window.location.href);
      return;
    }

    setPageState('loading');
    setLoadingState({ isLoading: true, progress: 0, message: 'Initiating real-time search...' });

    // Start elapsed timer
    setElapsedTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
    }, 1000);

    const progressInterval = setInterval(() => {
      setLoadingState(prevState => {
        const newProgress = Math.min(prevState.progress + 5, 95);
        const messageIndex = Math.floor(newProgress / (100 / loadingMessages.length));
        return {
          ...prevState,
          progress: newProgress,
          message: loadingMessages[messageIndex] || 'Finalizing...'
        }
      });
    }, 2500);
    
    try {
      setLoadingState(prevState => ({ ...prevState, message: 'Generating comprehensive analysis...' }));
      
      const { data: auditReportJson, error: apiError } = await brandRanker({
          task: 'generate_full_audit',
          payload: { 
            companyName: company,
            unbrandedPrompts: auditInputs.unbranded,
            competitorPrompts: auditInputs.competitor,
            competitors: auditInputs.competitors,
          }
      });
      
      if (apiError) throw new Error(apiError.error || 'API call failed');
      
      const auditReport = { 
        company_name: company, 
        audit_date: new Date().toISOString(),
        ...auditReportJson
      };

      const savedAudit = await BrandAudit.create(auditReport);
      setAuditData(savedAudit);
      setAllAudits([savedAudit, ...allAudits]);
      setCurrentAuditIndex(0); 
      setPageState('dashboard');
      
    } catch (err) {
      console.error("Error generating audit:", err);
      let errorMessage = 'Unknown error occurred';
      
      if (err.message) {
        if (err.message.includes('429')) {
          errorMessage = 'Server is temporarily busy. Please wait a moment and try again.';
        } else if (err.message.includes('401')) {
          errorMessage = 'Authentication required. Please log in and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(`Failed to generate brand audit: ${errorMessage}.`);
      setPageState('promptInput');
    } finally {
      clearInterval(progressInterval);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setLoadingState({ isLoading: false, progress: 100, message: 'Done' });
    }
  };

  const handleViewAudit = (auditId) => {
    const auditIndex = allAudits.findIndex(a => a.id === auditId);
    if (auditIndex !== -1) {
      setAuditData(allAudits[auditIndex]);
      setCurrentAuditIndex(auditIndex);
    }
  };
  
  const navigateToAudit = (direction) => {
    const newIndex = direction === 'prev' ? currentAuditIndex + 1 : currentAuditIndex - 1;
    if (newIndex >= 0 && newIndex < allAudits.length) {
      setAuditData(allAudits[newIndex]);
      setCurrentAuditIndex(newIndex);
    }
  };

  const uniqueAuditsByDay = Object.values(
    allAudits.reduce((acc, audit) => {
      const dateString = audit.created_date || audit.audit_date;
      if (!dateString) return acc;

      const day = new Date(dateString).toISOString().split('T')[0];
      
      if (!acc[day] || new Date(dateString) > new Date(acc[day].created_date || acc[day].audit_date)) {
        acc[day] = audit;
      }
      return acc;
    }, {})
  ).sort((a, b) => new Date(a.created_date || a.audit_date).getTime() - new Date(b.created_date || b.audit_date).getTime());

  if (pageState === 'initializing') {
      return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><LogoLoader progress={0} companyName={companyName} message="Initializing..." /></div>;
  }
  
  if (pageState === 'promptInput') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
           <PromptInputForm 
              companyName={companyName} 
              onSubmit={(inputs) => generateAuditReport(companyName, inputs)} 
              isGenerating={loadingState.isLoading}
            />
            {error && (
              <div className="text-center mt-4">
                <p className="text-red-500 font-medium">{error}</p>
                {error.includes('temporarily busy') && (
                  <p className="text-sm text-gray-500 mt-2">
                    This usually resolves within a few seconds. Please try again.
                  </p>
                )}
              </div>
            )}
        </div>
      );
  }

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LogoLoader 
          progress={loadingState.progress}
          companyName={companyName}
          message={loadingState.message}
          elapsedTime={elapsedTime}
        />
      </div>
    );
  }

  if (pageState === 'dashboard' && !auditData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center text-gray-700">
        No audit data found. Please try generating a new report.
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"
        >
          <div>
            <Button variant="outline" onClick={() => navigate(createPageUrl("Home"))} className="mb-4 hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Search
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Brand Analysis</h1>
            <p className="text-gray-600 mt-2">AI Search Visibility Report • Generated {new Date(auditData.audit_date || auditData.created_date).toLocaleDateString()}</p>
          </div>
          <Button onClick={() => setPageState('promptInput')} variant="outline" className="hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate with New Prompts
          </Button>
        </motion.div>

        {/* Version Navigation Bar */}
        {allAudits.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-100 rounded-lg p-3 mb-6 flex items-center justify-between"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateToAudit('prev')}
              disabled={currentAuditIndex >= allAudits.length - 1}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous Version
            </Button>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                Version {allAudits.length - currentAuditIndex} of {allAudits.length}
              </p>
              <p className="text-xs text-gray-500">
                Generated {new Date(auditData.created_date || auditData.audit_date).toLocaleDateString()} at {new Date(auditData.created_date || auditData.audit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateToAudit('next')}
              disabled={currentAuditIndex <= 0}
              className="text-gray-600 hover:text-gray-800"
            >
              Next Version
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}
        
        <div className="space-y-8">
          <OverallScoreCard
            companyName={companyName}
            score={auditData.overall_score}
          />

          {uniqueAuditsByDay.length > 1 && (
            <ScoreHistoryChart 
              audits={uniqueAuditsByDay}
              scoreType="overall"
              onAuditClick={handleViewAudit}
            />
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <ClickableScoreCard
              title="AI Visibility Score"
              score={auditData.ai_visibility_score}
              description="The degree to which a company appears in responses generated by OpenAI for relevant, unbranded prompts."
              icon={Eye}
              index={1}
              to={createPageUrl(`AIVisibility?auditId=${auditData.id}`)}
            />
            <ClickableScoreCard
              title="Content Readiness Score"
              score={auditData.content_readiness_score}
              description="Scores a company's website content readiness for AI, including key factors of content depth, clarity, and availability."
              icon={BarChart3}
              index={2}
              to={createPageUrl(`ContentReadiness?auditId=${auditData.id}`)}
            />
          </div>

          {allAudits.length > 0 && (
            <AuditHistoryLog 
              audits={allAudits}
              onAuditClick={handleViewAudit}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
