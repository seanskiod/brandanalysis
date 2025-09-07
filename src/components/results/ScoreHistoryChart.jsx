import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function ScoreHistoryChart({ audits, scoreType, onAuditClick }) {
  const chartData = useMemo(() => {
    return audits.map(audit => ({
      date: new Date(audit.created_date).toLocaleDateString(),
      score: scoreType === 'overall' ? audit.overall_score : 
             scoreType === 'content' ? audit.content_readiness_score : 
             audit.ai_visibility_score,
      auditId: audit.id,
      fullDate: audit.created_date
    })).reverse();
  }, [audits, scoreType]);

  const getScoreTypeTitle = () => {
    switch(scoreType) {
      case 'overall': return 'Overall Score';
      case 'content': return 'Content Readiness Score';
      case 'visibility': return 'AI Visibility Score';
      default: return 'Score';
    }
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#287de0"
        stroke="#fff"
        strokeWidth={2}
        className="cursor-pointer hover:r-8 transition-all"
        onClick={() => onAuditClick && onAuditClick(payload.auditId)}
      />
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {getScoreTypeTitle()} History
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              domain={[0, 10]}
              stroke="#666"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#287de0"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 8, fill: '#287de0' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Click on any point to view that audit in detail
      </p>
    </motion.div>
  );
}