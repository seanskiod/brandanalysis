
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Sparkles, Users, Search, Wand2, Loader2, ShieldCheck } from 'lucide-react';
import { brandRanker } from '@/api/functions';
import CompetitorSelector from './CompetitorSelector';

const PromptInputForm = ({ companyName, onSubmit, isGenerating }) => {
  const [prompts, setPrompts] = useState({
    unbranded: Array(5).fill(''),
    competitor: Array(5).fill('')
  });
  const [competitors, setCompetitors] = useState([]);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  const handlePromptChange = (type, index, value) => {
    const newPrompts = { ...prompts };
    newPrompts[type][index] = value;
    setPrompts(newPrompts);
  };

  const handleAutoGenerate = async () => {
    setIsAutoGenerating(true);
    try {
      const { data, error } = await brandRanker({
        task: 'generate_prompts',
        payload: { companyName }
      });

      if (error) {
        throw new Error(error.error || 'Failed to generate prompts');
      }

      setPrompts({
        unbranded: [...(data.unbranded || []), ...Array(Math.max(0, 5 - (data.unbranded || []).length)).fill('')],
        competitor: [...(data.competitor || []), ...Array(Math.max(0, 5 - (data.competitor || []).length)).fill('')]
      });
    } catch (error) {
      console.error('Error generating prompts:', error);
      // Could add error toast here if needed
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPrompts = {
      unbranded: prompts.unbranded.filter((p) => p.trim() !== ''),
      competitor: prompts.competitor.filter((p) => p.trim() !== '')
    };

    onSubmit({ ...finalPrompts, competitors });
  };

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

  const displayLogoUrl = logoOverrides[companyName] || `https://logo.clearbit.com/${companyName.toLowerCase().replace(/\s+/g, '').replace(/&/g, 'and')}.com`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-200 relative">

            {/* Company Logo in top left */}
            <div className="absolute top-6 left-6 w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden p-2">
                <img
          src={displayLogoUrl}
          alt={`${companyName} logo`}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=287de0&color=fff&size=128&format=png`;
          }} />

            </div>

            <div className="text-center mb-8 ml-40">
                <h1 className="text-3xl font-bold text-gray-900">Customize Your Audit</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Provide custom prompts for <span className="font-semibold text-[#287de0]">{companyName}</span> to tailor the analysis.
                </p>
                
                <div className="mt-4 flex items-center justify-center gap-4">
                    <Button
            onClick={handleAutoGenerate}
            disabled={isAutoGenerating || isGenerating}
            variant="outline"
            className="gap-2">

                        {isAutoGenerating ?
            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </> :

            <>
                                <Wand2 className="w-4 h-4" />
                                Auto-Generate Prompts
                            </>
            }
                    </Button>
                    <p className="text-right text-xs font-semibold text-left uppercase"></p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Unbranded Prompts Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        Unbranded Search Prompts
                    </h2>
                    <div className="space-y-3">
                        {prompts.unbranded.map((prompt, index) =>
            <Input
              key={`unbranded-${index}`}
              placeholder={`Unbranded Prompt ${index + 1}`}
              value={prompt}
              onChange={(e) => handlePromptChange('unbranded', index, e.target.value)}
              className="bg-gray-50"
              disabled={isAutoGenerating} />

            )}
                    </div>
                </div>

                {/* Competitor Prompts Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Competitor Search Prompts
                    </h2>
                    <div className="space-y-3">
                        {prompts.competitor.map((prompt, index) =>
            <Input
              key={`competitor-${index}`}
              placeholder={`Competitor Search Prompt ${index + 1}`}
              value={prompt}
              onChange={(e) => handlePromptChange('competitor', index, e.target.value)}
              className="bg-gray-50"
              disabled={isAutoGenerating} />

            )}
                    </div>
                </div>

                {/* Competitors Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-purple-500" />
                        Select Competitors (Optional)
                    </h2>
                     <p className="text-sm text-gray-500 mb-4 -mt-2">Add up to 5 competitors to compare against. If left blank, we'll find them for you.</p>
                    <CompetitorSelector competitors={competitors} setCompetitors={setCompetitors} />
                </div>


                <div className="text-center pt-4">
                    <Button type="submit" size="lg" className="w-full max-w-xs bg-[#287de0] hover:bg-[#1e6bc7]" disabled={isGenerating || isAutoGenerating}>
                        {isGenerating ?
            <div className="flex items-center gap-2">
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             Generating...
                           </div> :

            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Generate Audit
                            </div>
            }
                    </Button>
                </div>
            </form>
        </motion.div>);

};

export default PromptInputForm;