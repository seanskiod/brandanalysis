
import React, { useState, useEffect } from "react";
import { BrandAudit } from "@/api/entities";
import { brandRanker } from "@/api/functions";
import { ArrowLeft, Bot, ArrowUp, ArrowDown, Edit, Save, X, Plus, Loader2, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import ScoreRing from "../components/common/ScoreRing";
import CompanyHeaderCard from "../components/results/CompanyHeaderCard";
import ScoreHistoryChart from "../components/results/ScoreHistoryChart";
import CompetitorPromptTable from "../components/results/CompetitorPromptTable";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Code } from 'lucide-react';

const singlePromptSchema = {
  "type": "object",
  "properties": {
    "prompt": { "type": "string" },
    "score": { "type": "number", "minimum": 0, "maximum": 10 },
    "note": { "type": "string" },
    "source": { "type": "string" },
    "source_url": { "type": "string" },
    "ai_response": { "type": "string" },
    "full_response": { "type": "string" },
    "top_10_ranking": {
      "type": "array", "items": { "type": "object", "properties": { "rank": { "type": "number" }, "company": { "type": "string" } }, "required": ["rank", "company"] }, "minItems": 10, "maxItems": 10
    }
  },
  "required": ["prompt", "score", "note", "source", "source_url", "ai_response", "full_response", "top_10_ranking"]
};

const PromptRow = ({ promptData, index, onEdit, onSave, onCancel, isEditing, isLoading, auditedCompany }) => {
    const { prompt, score, note, ai_response, full_response, top_10_ranking } = promptData;
    const [editText, setEditText] = useState(prompt);
    const [isRawView, setIsRawView] = useState(false);

    useEffect(() => {
        setEditText(prompt);
    }, [prompt]);

    const getFormattedRawResponse = () => {
        if (!full_response) {
            return '{}';
        }
        try {
            const parsed = JSON.parse(full_response);
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            return full_response;
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-12 gap-4 items-center p-3 border-b min-h-[68px]">
                <div className="col-span-12 flex items-center justify-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Analyzing new prompt...
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="grid grid-cols-12 gap-4 items-center p-3 border-b bg-blue-50">
                <div className="col-span-10">
                    <Input value={editText} onChange={(e) => e.target.value.length <= 250 && setEditText(e.target.value)} placeholder="Enter new search prompt (max 250 characters)" />
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => onSave(index, editText)} className="text-green-600 hover:text-green-700" disabled={!editText.trim()}><Save className="w-4 h-4"/></Button>
                    <Button size="icon" variant="ghost" onClick={onCancel} className="text-red-600 hover:text-red-700"><X className="w-4 h-4"/></Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="grid grid-cols-12 gap-4 items-center p-3 border-b group"
        >
            <div className="col-span-8 font-medium text-gray-800 flex items-center gap-3">
                <Dialog onOpenChange={() => setIsRawView(false)}>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-[#287de0] hover:text-[#1e6bc7] flex-shrink-0">
                            <MessageSquare className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png" alt="ChatGPT Logo" className="w-6 h-6" />
                                Full AI Response
                            </DialogTitle>
                            <DialogDescription>
                                For the prompt: "{prompt}"
                            </DialogDescription>
                        </DialogHeader>

                        {isRawView ? (
                            <div className="py-4 max-h-[60vh] overflow-y-auto bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-md">
                                <pre><code>{getFormattedRawResponse()}</code></pre>
                            </div>
                        ) : (
                            <div className="py-4 max-h-[60vh] overflow-y-auto space-y-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-gray-600" /></div>
                                    <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
                                        <p className="font-semibold text-gray-800">You</p>
                                        <p className="text-gray-700">{prompt}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png" alt="ChatGPT Logo" className="w-5 h-5" />
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg rounded-bl-none flex-1">
                                        <p className="font-semibold text-green-800">ChatGPT</p>
                                        <p className="text-gray-800">{ai_response}</p>
                                    </div>
                                </div>
                                
                                {top_10_ranking && top_10_ranking.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Top 10 Ranking Analysis</h4>
                                        <div className="space-y-2">
                                            {top_10_ranking.map(item => (
                                                <div key={item.rank} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                                    <span className={`font-medium ${item.company === auditedCompany ? 'font-bold text-[#287de0]' : ''}`}>
                                                        {item.rank}. {item.company}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRawView(!isRawView)}>
                                <Code className="w-4 h-4 mr-2" />
                                {isRawView ? "Show Chat View" : "Show Raw Response"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <p className="truncate cursor-pointer" title={prompt}>{prompt}</p>
            </div>
            <div className="col-span-3 flex justify-center">
                <ScoreRing score={score} size="w-12 h-12" strokeWidth={3} fontSize="text-sm" />
            </div>
            <div className="col-span-1 flex justify-end">
                <Button size="icon" variant="ghost" onClick={() => onEdit(index)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="w-4 h-4"/>
                </Button>
            </div>
        </motion.div>
    );
};

export default function AIVisibility() {
    const navigate = useNavigate();
    const [audit, setAudit] = useState(null);
    const [allAudits, setAllAudits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');

    const [editingPromptIndex, setEditingPromptIndex] = useState(null);
    const [loadingPromptIndex, setLoadingPromptIndex] = useState(null);
    const [isBatchUpdating, setIsBatchUpdating] = useState(false);

    useEffect(() => {
        const auditId = new URLSearchParams(window.location.search).get('auditId');
        if (auditId) {
            fetchAudit(auditId);
        } else {
            setError("No audit specified.");
            setIsLoading(false);
        }
    }, []);

    const fetchAudit = async (id) => {
        setIsLoading(true);
        try {
            const allAuditsData = await BrandAudit.list();
            const currentAudit = allAuditsData.find(audit => audit.id === id);

            if (!currentAudit) {
                throw new Error("Audit not found.");
            }
            if (!currentAudit.ai_visibility_details) {
                throw new Error("AI visibility data is not available for this audit.");
            }

            setAudit(currentAudit);

            const companyAudits = allAuditsData
                .filter(a => a.company_name === currentAudit.company_name)
                .sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());
            setAllAudits(companyAudits);

        } catch (e) {
            setError(e.message);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewAudit = (auditId) => {
        const targetAudit = allAudits.find(a => a.id === auditId);
        if (targetAudit) {
            setAudit(targetAudit);
            window.history.replaceState({}, '', createPageUrl(`AIVisibility?auditId=${auditId}`));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleUpdatePrompt = async (index, newPromptText) => {
        if (!newPromptText.trim()) {
            handleCancelEdit(index);
            return;
        }
        setLoadingPromptIndex(index);
        setEditingPromptIndex(null);

        try {
            const { data: newPromptData, error: apiError } = await brandRanker({
                task: 'update_ai_visibility_prompt',
                payload: {
                    newPromptText,
                    companyName: audit.company_name
                }
            });
            if(apiError) throw new Error(apiError.error || 'Failed to process prompt.');
            
            // Add the audited company name to the prompt data for highlighting
            newPromptData.auditedCompany = audit.company_name;
            
            const newAudit = JSON.parse(JSON.stringify(audit));
            const newSearchPrompts = [...(newAudit.ai_visibility_details.search_prompts || [])];

            if (index >= newSearchPrompts.length) {
                newSearchPrompts.push(newPromptData);
            } else {
                newSearchPrompts[index] = newPromptData;
            }

            newAudit.ai_visibility_details.search_prompts = newSearchPrompts;

            await BrandAudit.update(audit.id, { ai_visibility_details: newAudit.ai_visibility_details });
            setAudit(newAudit);
        } catch (e) {
            console.error("Failed to update prompt:", e);
            setError(`Failed to process prompt: ${e.message}`);
        } finally {
            setLoadingPromptIndex(null);
        }
    };

    const handleUpdateCompetitorPrompt = async (action, payload) => {
        setLoadingPromptIndex(action === 'add' ? 'new' : payload.index);
        try {
            const task = 'update_competitor_scores';
            const apiPayload = {
                promptText: action === 'add' ? payload.promptText : payload.newPromptText,
                companyNames: payload.companyNames
            };

            const { data: newPromptData, error: apiError } = await brandRanker({ task, payload: apiPayload });
            if(apiError) throw new Error(apiError.error || 'Failed to process prompt.');
            
            const newAudit = JSON.parse(JSON.stringify(audit));
            const newCompetitorPrompts = [...(newAudit.ai_visibility_details.competitor_search_prompts || [])];

            if (action === 'add') {
                newCompetitorPrompts.push(newPromptData);
            } else { // 'update'
                newCompetitorPrompts[payload.index] = newPromptData;
            }
            
            newAudit.ai_visibility_details.competitor_search_prompts = newCompetitorPrompts;

            await BrandAudit.update(audit.id, { ai_visibility_details: newAudit.ai_visibility_details });
            setAudit(newAudit);

        } catch (e) {
            console.error("Failed to update competitor prompt:", e);
            setError(`Failed to process competitor prompt: ${e.message}`);
        } finally {
            setLoadingPromptIndex(null);
        }
    };

    const handleAddNewPrompt = () => {
        const currentPrompts = audit?.ai_visibility_details?.search_prompts || [];
        const newPrompts = [...currentPrompts, { prompt: "", score: 0, note: "", ai_response: "", full_response: "", top_10_ranking: [] }];

        setAudit(prevAudit => ({
            ...prevAudit,
            ai_visibility_details: {
                ...prevAudit.ai_visibility_details,
                search_prompts: newPrompts
            }
        }));
        setEditingPromptIndex(newPrompts.length - 1);
    };

    const handleCancelEdit = (index) => {
        const currentPrompts = audit?.ai_visibility_details?.search_prompts || [];
        if (index === currentPrompts.length -1 && !currentPrompts[index]?.prompt) {
             const newPrompts = currentPrompts.slice(0, -1);
             setAudit(prevAudit => ({
                ...prevAudit,
                ai_visibility_details: {
                    ...prevAudit.ai_visibility_details,
                    search_prompts: newPrompts
                }
            }));
        }
        setEditingPromptIndex(null);
    };

    const handleCompetitorsChange = async (newCompetitorList) => {
        setIsBatchUpdating(true);
        const oldPrompts = audit.ai_visibility_details.competitor_search_prompts.map(p => p.prompt);
        const allCompanies = [audit.company_name, ...newCompetitorList];

        try {
            const updatedPromptsPromises = oldPrompts.map(promptText => 
                brandRanker({
                    task: 'update_competitor_scores',
                    payload: { promptText, companyNames: allCompanies }
                })
            );

            const results = await Promise.all(updatedPromptsPromises);
            
            const updatedPrompts = results.map(res => {
                if (res.error) throw new Error(res.error.error || `Failed on prompt: ${res.payload.promptText}`);
                return res.data;
            });

            const newAudit = JSON.parse(JSON.stringify(audit));
            newAudit.competitors = newCompetitorList;
            newAudit.ai_visibility_details.competitor_search_prompts = updatedPrompts;
            await BrandAudit.update(audit.id, { 
                ai_visibility_details: newAudit.ai_visibility_details,
                competitors: newCompetitorList 
            });
            setAudit(newAudit);
        } catch(e) {
            console.error("Failed to batch update competitor prompts:", e);
            setError("Error updating competitor scores. Please try again.");
        } finally {
            setIsBatchUpdating(false);
        }
    };

    const sortedPrompts = React.useMemo(() =>
        (audit?.ai_visibility_details?.search_prompts || []).sort((a, b) => {
            if (sortOrder === 'asc') return (a.score || 0) - (b.score || 0);
            return (b.score || 0) - (a.score || 0);
        }),
    [audit, sortOrder]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading AI Visibility Report...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    if (!audit) return null;

    const { company_name, ai_visibility_details: details = {}, ai_visibility_score, created_date, company_logo_url } = audit;

    const uniqueAuditsByDay = Object.values(
      allAudits.reduce((acc, currentAudit) => {
        const day = currentAudit.created_date.split('T')[0];
        if (!acc[day] || new Date(currentAudit.created_date).getTime() > new Date(acc[day].created_date).getTime()) {
          acc[day] = currentAudit;
        }
        return acc;
      }, {})
    );

    const visibilityDescription = `AI Search Visibility is the degree (on a scale of 10 where 10 is best) to which ${company_name} appears in responses generated by AI answer engines. It reflects the brand's presence in category-related queries and its influence on consumer decision-making and perceptions. A high AI Search Visibility score ensures a brand is discoverable and competitively positioned within generative AI ecosystems.`
    
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
                        score={ai_visibility_score}
                        description={visibilityDescription}
                        lastUpdate={format(new Date(created_date), 'MM/dd/yy, hh:mm a')}
                        logoUrl={company_logo_url || `https://logo.clearbit.com/${company_name.toLowerCase().replace(/\s+/g, '')}.com`}
                        title="AI Visibility"
                    />

                    {uniqueAuditsByDay.length > 1 && (
                        <ScoreHistoryChart
                            audits={uniqueAuditsByDay}
                            scoreType="visibility"
                            onAuditClick={handleViewAudit}
                        />
                    )}

                    <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-gray-900">Unbranded Search Prompts</h3>
                            <Button onClick={handleAddNewPrompt}><Plus className="w-4 h-4 mr-2"/>Add Prompt</Button>
                        </div>
                        <p className="text-gray-600 mb-6">Based on daily search of {details.search_prompts?.length || 0} phrases across OpenAI.</p>

                        <div className="grid grid-cols-12 gap-4 p-3 border-b bg-gray-50 rounded-t-lg">
                            <div className="col-span-8 font-semibold text-gray-600">Search Prompt</div>
                            <div className="col-span-3 text-center font-semibold text-gray-600">
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="flex items-center gap-1 mx-auto hover:text-gray-800"
                                >
                                    Score
                                    {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="col-span-1"></div>
                        </div>

                        <AnimatePresence>
                            {sortedPrompts.map((prompt, index) => (
                                <PromptRow
                                    key={prompt.prompt + index}
                                    promptData={{...prompt, auditedCompany: audit.company_name}}
                                    index={index}
                                    onEdit={setEditingPromptIndex}
                                    onSave={handleUpdatePrompt}
                                    onCancel={() => handleCancelEdit(index)}
                                    isEditing={editingPromptIndex === index}
                                    isLoading={loadingPromptIndex === index}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {details.competitor_search_prompts && (
                        <CompetitorPromptTable
                            mainCompanyName={company_name}
                            allCompetitors={audit.competitors || []}
                            competitorPrompts={details.competitor_search_prompts}
                            onUpdateCompetitors={handleCompetitorsChange}
                            onUpdatePrompt={handleUpdateCompetitorPrompt}
                            isUpdating={isBatchUpdating}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
