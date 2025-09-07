
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit3, ArrowDown, ArrowUp, Edit, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScoreRing from '../common/ScoreRing';
import { BrandAudit } from "@/api/entities";
import { brandRanker } from "@/api/functions";
import { Company } from "@/api/entities";

const singleCompetitorPromptSchema = {
    "type": "object",
    "properties": {
        "company_scores": {
            "type": "object",
            "additionalProperties": { "type": "number", "minimum": 0, "maximum": 10 }
        }
    },
    "required": ["company_scores"]
};

const CompetitorPromptRow = ({ row, companies, onEdit, onSave, onCancel, isEditing, isLoading }) => {
    const [editText, setEditText] = useState(row.prompt);
    
    useEffect(() => {
        setEditText(row.prompt);
    }, [row.prompt]);

    if (isLoading) {
        return (
            <tr className="border-b">
                <td colSpan={companies.length + 1} className="p-3 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Analyzing...
                    </div>
                </td>
            </tr>
        );
    }
    
    if (isEditing) {
        return (
            <tr className="border-b bg-blue-50">
                <td className="p-3" colSpan={companies.length + 1}> {/* +1 for prompt column */}
                    <Input value={editText} onChange={(e) => setEditText(e.target.value)} />
                </td>
                <td className="p-3 text-center">
                    <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => onSave(editText)} className="text-green-600 hover:text-green-700"><Save className="w-4 h-4"/></Button>
                        <Button size="icon" variant="ghost" onClick={onCancel} className="text-red-600 hover:text-red-700"><X className="w-4 h-4"/></Button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="border-b hover:bg-gray-50/70 group"
        >
            <td className="p-3 font-medium">
                <span className="flex items-center justify-between w-full">
                    {row.prompt}
                    <Button size="icon" variant="ghost" onClick={onEdit} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit className="w-4 h-4"/>
                    </Button>
                </span>
            </td>
            {companies.map(company => (
                <td key={company} className="p-3 text-center">
                    <div className="flex justify-center">
                        <ScoreRing score={row.company_scores?.[company] ?? 0} size="w-12 h-12" strokeWidth={3} fontSize="text-sm" />
                    </div>
                </td>
            ))}
        </motion.tr>
    );
};

// New component for managing competitors
const EditableCompetitorList = ({ initialCompetitors, onUpdate, isUpdating, mainCompanyName }) => {
    const [competitors, setCompetitors] = useState(initialCompetitors);
    const [newCompetitor, setNewCompetitor] = useState('');

    useEffect(() => {
        setCompetitors(initialCompetitors);
    }, [initialCompetitors]);

    const addCompetitor = () => {
        const trimmedNewCompetitor = newCompetitor.trim();
        if (trimmedNewCompetitor && trimmedNewCompetitor !== mainCompanyName && !competitors.includes(trimmedNewCompetitor) && competitors.length < 5) {
            const updatedList = [...competitors, trimmedNewCompetitor];
            setCompetitors(updatedList);
            onUpdate(updatedList);
            setNewCompetitor('');
        }
    };

    const removeCompetitor = (comp) => {
        const updatedList = competitors.filter(c => c !== comp);
        setCompetitors(updatedList);
        onUpdate(updatedList);
    };

    return (
        <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="text-lg font-semibold mb-3">Manage Competitors (Max 5)</h4>
            <div className="flex gap-2 mb-3">
                <Input
                    placeholder="Add competitor..."
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
                    disabled={competitors.length >= 5 || isUpdating || newCompetitor.trim() === mainCompanyName}
                />
                <Button onClick={addCompetitor} disabled={competitors.length >= 5 || !newCompetitor.trim() || isUpdating || newCompetitor.trim() === mainCompanyName}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {competitors.map(comp => (
                    <div key={comp} className="flex items-center gap-1 bg-white px-3 py-1 rounded-lg border">
                        <span className="text-sm">{comp}</span>
                        <button onClick={() => removeCompetitor(comp)} className="text-red-500 hover:text-red-700" disabled={isUpdating}>
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
            {competitors.length >= 5 && (
                <p className="text-xs text-gray-500 mt-2">Maximum 5 competitors allowed</p>
            )}
            {isUpdating && <p className="text-sm text-gray-500 mt-2">Updating competitors...</p>}
        </div>
    );
};

// New component for adding new prompts
const NewPromptRow = ({ onAdd, isAdding }) => {
    const [newPromptText, setNewPromptText] = useState('');

    const handleAdd = async () => {
        if (newPromptText.trim()) {
            await onAdd(newPromptText);
            setNewPromptText('');
        }
    };

    return (
        <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 rounded-xl">
            <Input
                placeholder="Add a new search prompt..."
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                disabled={isAdding}
            />
            <Button onClick={handleAdd} disabled={!newPromptText.trim() || isAdding}>
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Prompt
            </Button>
        </div>
    );
};


export default function CompetitorPromptTable({ competitorPrompts, mainCompanyName, allCompetitors = [], onUpdateCompetitors, onUpdatePrompt, isUpdating }) {
    const [prompts, setPrompts] = useState(competitorPrompts);
    const [editingPromptIndex, setEditingPromptIndex] = useState(null);
    const [loadingPromptIndex, setLoadingPromptIndex] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: mainCompanyName, direction: 'desc' });
    const [companies, setCompanies] = useState({}); // Changed to object for easier lookup of logos
  
    useEffect(() => {
        setPrompts(competitorPrompts);
    }, [competitorPrompts]);

    const allCompanies = useMemo(() => {
        const competitorSet = new Set(allCompetitors || []);
        (prompts || []).forEach(prompt => {
            if (prompt.company_scores) {
                Object.keys(prompt.company_scores).forEach(companyName => {
                    if (companyName !== mainCompanyName) {
                        competitorSet.add(companyName);
                    }
                });
            }
        });
        return [mainCompanyName, ...Array.from(competitorSet)];
    }, [mainCompanyName, allCompetitors, prompts]);

    useEffect(() => {
        const loadCompanies = async () => {
          try {
            const companiesData = await Company.list();
            const companiesMap = {};
            companiesData.forEach(company => {
              companiesMap[company.name] = company.logo_url;
            });
            setCompanies(companiesMap);
          } catch (error) {
            console.error('Error loading companies:', error);
          }
        };
        loadCompanies();
      }, []);

    const sortedData = useMemo(() => {
        if (!prompts || !prompts.length) return []; // Use 'prompts' state

        const sortedTableData = [...prompts].sort((a, b) => { // Use 'prompts' state
            let aValue, bValue;
            if (sortConfig.key === 'prompt') {
                aValue = a.prompt;
                bValue = b.prompt;
            } else {
                aValue = a.company_scores?.[sortConfig.key] ?? -1;
                bValue = b.company_scores?.[sortConfig.key] ?? -1;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        return sortedTableData;
    }, [prompts, sortConfig, allCompanies]); // Changed promptData to prompts

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    const getCompanyLogo = (companyName) => {
        return companies[companyName] || `https://logo.clearbit.com/${companyName.toLowerCase().replace(/\s+/g, '').replace(/&/g, 'and')}.com`;
    };

    const handleUpdatePrompt = async (index, newText) => {
        if (!newText.trim()) {
            handleCancelEdit(index); 
            return;
        }
        setLoadingPromptIndex(index);
        setEditingPromptIndex(null);

        try {
            await onUpdatePrompt('update', { index, newPromptText: newText, companyNames: allCompanies });
        } catch (e) {
            console.error("Failed to update competitor prompt:", e);
        } finally {
            setLoadingPromptIndex(null);
        }
    };

    const handleAddNewPrompt = async (newPromptText) => {
        if (!newPromptText.trim()) return;
        setLoadingPromptIndex('new'); 
        setEditingPromptIndex(null);

        try {
            await onUpdatePrompt('add', { promptText: newPromptText, companyNames: allCompanies });
        } catch (e) {
            console.error("Failed to add new competitor prompt:", e);
        } finally {
            setLoadingPromptIndex(null);
        }
    };
    
    const handleCancelEdit = (index) => {
        setEditingPromptIndex(null);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Competitor Search Prompts</h3>
                    <p className="text-gray-600 mt-1">Overall visibility of top competitors</p>
                </div>
                <EditableCompetitorList 
                    initialCompetitors={allCompetitors}
                    onUpdate={onUpdateCompetitors}
                    isUpdating={isUpdating}
                    mainCompanyName={mainCompanyName}
                />
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="text-left p-3 font-semibold w-60">
                                <button className="flex items-center" onClick={() => requestSort('prompt')}>
                                    Competitor Search Prompts
                                    {sortConfig.key === 'prompt' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-2"/> : <ArrowDown className="w-4 h-4 ml-2"/>)}
                                </button>
                            </th>
                            {allCompanies.map(company => (
                                <th key={company} className="p-3 font-semibold min-w-[120px]">
                                    <button className="flex flex-col items-center mx-auto gap-1 w-28 h-16 justify-center" onClick={() => requestSort(company)}>
                                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center p-0.5 shadow">
                                            <img 
                                                src={getCompanyLogo(company)} 
                                                alt={`${company} logo`} 
                                                className="w-full h-full object-contain" 
                                                onError={(e) => { 
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=287de0&color=fff&size=24&format=png`;
                                                }}
                                            />
                                        </div>
                                        <span className="flex items-center text-sm text-center">
                                            {company}
                                            {sortConfig.key === company && (sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 ml-2"/> : <ArrowDown className="w-4 h-4 ml-2"/>)}
                                        </span>
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {sortedData.map((row, index) => (
                                <CompetitorPromptRow
                                    key={row.prompt + index} // Changed key to ensure uniqueness as prompt text might change or be empty
                                    row={row}
                                    companies={allCompanies}
                                    onEdit={() => setEditingPromptIndex(index)}
                                    onSave={(newText) => handleUpdatePrompt(index, newText)}
                                    onCancel={() => handleCancelEdit(index)}
                                    isEditing={editingPromptIndex === index}
                                    isLoading={loadingPromptIndex === index || isUpdating}
                                />
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
            <NewPromptRow onAdd={handleAddNewPrompt} isAdding={loadingPromptIndex === 'new'} />
        </div>
    );
}
