
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Brain, BarChart3, Eye, Target, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const StepCard = ({ step, title, description, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-[#287de0]/10 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#287de0]" />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-500">Step {step}</div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
    </div>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const MetricCard = ({ title, description, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
  >
    <div className="w-12 h-12 bg-[#287de0]/10 rounded-xl flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-[#287de0]" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const FeatureItem = ({ text, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-start gap-3"
  >
    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
    <p className="text-gray-700">{text}</p>
  </motion.div>
);

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl("Home"))} 
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How This Analysis Works
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover how our AI-powered brand auditing system analyzes your company's 
              visibility and content readiness across AI search engines.
            </p>
          </div>
        </motion.div>

        {/* Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                AI Search Visibility Analytics
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                BrandRank.AI is the first comprehensive platform to analyze how brands 
                perform in AI-generated responses. As consumers increasingly rely on AI 
                assistants for recommendations, understanding your brand's visibility 
                in these systems becomes crucial for business success.
              </p>
              <div className="space-y-3">
                <FeatureItem text="Real-time analysis of AI search results" delay={0.3} />
                <FeatureItem text="Comprehensive competitor benchmarking" delay={0.4} />
                <FeatureItem text="Actionable content optimization recommendations" delay={0.5} />
                <FeatureItem text="Industry-specific ranking insights" delay={0.6} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#287de0]/10 to-[#287de0]/5 rounded-2xl p-8 text-center">
              <div className="w-32 h-32 bg-[#287de0]/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <Brain className="w-16 h-16 text-[#287de0]" />
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png" 
                    alt="GPT" 
                    className="w-6 h-6"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Powered by AI</h3>
              <p className="text-gray-600">
                Our system uses advanced AI to simulate real user queries and analyze 
                brand mentions across multiple AI platforms.
              </p>
            </div>
          </div>
        </motion.div>

        {/* How It Works Steps */}
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 text-center mb-8"
          >
            The Analysis Process
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StepCard
              step={1}
              title="Input Company & Prompts"
              description="Enter your company name and customize search prompts, or let our AI generate industry-specific queries automatically."
              icon={Search}
              delay={0.4}
            />
            <StepCard
              step={2}
              title="AI Query Analysis"
              description="Our system runs your prompts through multiple AI engines, analyzing where your brand appears in responses and ranking positions."
              icon={Brain}
              delay={0.5}
            />
            <StepCard
              step={3}
              title="Content Evaluation"
              description="We assess your website's content across availability, depth, and clarity dimensions to determine AI-readiness."
              icon={BarChart3}
              delay={0.6}
            />
            <StepCard
              step={4}
              title="Competitor Benchmarking"
              description="Compare your performance against industry competitors across all metrics and search scenarios."
              icon={Target}
              delay={0.7}
            />
            <StepCard
              step={5}
              title="Score Calculation"
              description="Generate comprehensive scores for AI visibility, content readiness, and overall brand performance."
              icon={Zap}
              delay={0.8}
            />
            <StepCard
              step={6}
              title="Actionable Insights"
              description="Receive detailed recommendations for improving your brand's AI search visibility and content optimization."
              icon={CheckCircle}
              delay={0.9}
            />
          </div>
        </div>

        {/* Scoring Metrics */}
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-gray-900 text-center mb-8"
          >
            Understanding Your Scores
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <MetricCard
              title="AI Visibility Score"
              description="Measures how frequently your brand appears in AI-generated responses for relevant queries. Higher scores indicate better discoverability and competitive positioning in AI search results."
              icon={Eye}
              delay={0.5}
            />
            <MetricCard
              title="Content Readiness Score"
              description="Evaluates your website's content optimization for AI consumption across three key dimensions: Availability (how accessible your content is), Depth (comprehensiveness and authority), and Clarity (ease of understanding)."
              icon={BarChart3}
              delay={0.6}
            />
          </div>
        </div>

        {/* Content Readiness Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Content Readiness Dimensions
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Availability</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                <strong>Content Liquidity:</strong> How easily AI can access your content<br/>
                <strong>Search Capital:</strong> Your content's findability and indexing<br/>
                <strong>Algorithmic Anchors:</strong> Structured data and technical optimization
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Depth</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                <strong>Authoritative Content:</strong> Expertise and credibility signals<br/>
                <strong>Technical Content:</strong> Detailed product/service information<br/>
                <strong>Statistics & Citations:</strong> Data-backed claims and references<br/>
                <strong>Content Updates:</strong> Freshness and relevance
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Clarity</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                <strong>Easy to Understand:</strong> Content accessibility and readability<br/>
                <strong>Fluency Optimization:</strong> Natural language processing compatibility<br/>
                <strong>Structure & Format:</strong> How well content is organized for AI consumption
              </p>
            </div>
          </div>
        </motion.div>

        {/* Why It Matters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-[#287de0]/10 to-[#287de0]/5 rounded-2xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why AI Search Visibility Matters
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            As AI assistants become the primary way consumers discover products and services, 
            traditional SEO strategies are no longer sufficient. Brands that optimize for AI 
            search visibility today will dominate tomorrow's digital landscape. BrandRank.AI 
            gives you the insights and tools needed to stay ahead of this fundamental shift 
            in how consumers find and evaluate brands.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
