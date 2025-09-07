import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const MenuItem = ({ to, icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <Link to={to} className="block p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#287de0]/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-[#287de0]" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#287de0] transition-colors">{title}</h2>
                    <p className="text-gray-600 mt-1">{description}</p>
                </div>
            </div>
        </Link>
    </motion.div>
);

export default function MenuPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Menu</h1>
                    <p className="text-lg text-gray-600 mt-2">Navigate to different sections of the application.</p>
                </motion.div>
                
                <div className="space-y-8">
                    <MenuItem
                        to={createPageUrl("Home")}
                        icon={Home}
                        title="Brand Audit"
                        description="Analyze a new brand or view past reports."
                        delay={0.1}
                    />
                    <MenuItem
                        to={createPageUrl("Industry")}
                        icon={Briefcase}
                        title="Industry Rankings"
                        description="See how audited companies rank against each other."
                        delay={0.2}
                    />
                </div>
            </div>
        </div>
    );
}