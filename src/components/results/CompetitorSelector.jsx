
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CompetitorPill = ({ name, onRemove }) => {
    const logoUrl = `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, '').replace(/&/g, 'and')}.com`;
    const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e5e7eb&color=4b5563&size=128&format=png`;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex items-center gap-2 bg-gray-100 rounded-full pl-2 pr-1 py-1 text-sm font-medium text-gray-800 border border-gray-200"
        >
            <img 
                src={logoUrl} 
                alt={name} 
                className="w-5 h-5 rounded-full bg-white object-contain" 
                onError={(e) => { e.target.src = fallbackLogo; }} 
            />
            <span>{name}</span>
            <button onClick={onRemove} type="button" className="w-5 h-5 rounded-full bg-gray-300/50 hover:bg-gray-400/50 text-gray-600 flex items-center justify-center transition-colors">
                <X className="w-3 h-3" />
            </button>
        </motion.div>
    );
};

export default function CompetitorSelector({ competitors, setCompetitors }) {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        if (inputValue.trim() && competitors.length < 5 && !competitors.map(c => c.toLowerCase()).includes(inputValue.trim().toLowerCase())) {
            setCompetitors([...competitors, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemove = (nameToRemove) => {
        setCompetitors(competitors.filter(name => name !== nameToRemove));
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    }

    return (
        <div>
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter competitor name (e.g., 'PepsiCo')"
                    onKeyDown={handleKeyDown}
                    className="bg-gray-50"
                />
                <Button onClick={handleAdd} disabled={!inputValue.trim() || competitors.length >= 5} type="button" className="bg-[#287de0] hover:bg-[#1e6bc7]">
                    <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
            </div>
             {competitors.length >= 5 && <p className="text-xs text-red-500 mt-2">Maximum of 5 competitors reached.</p>}
            <div className="flex flex-wrap gap-2 mt-3 min-h-[34px]">
                <AnimatePresence>
                    {competitors.map(name => (
                        <CompetitorPill key={name} name={name} onRemove={() => handleRemove(name)} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
