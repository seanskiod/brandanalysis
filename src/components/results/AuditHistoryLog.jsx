import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditHistoryLog({ audits, onAuditClick }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Audit History</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {audits.map((audit, index) => (
          <motion.div
            key={audit.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onAuditClick && onAuditClick(audit.id)}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#287de0]/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#287de0]" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {format(new Date(audit.created_date), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(audit.created_date), 'h:mm a')}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-[#287de0]">{(audit.overall_score ?? 0).toFixed(1)}</div>
                <div className="text-xs text-gray-500">Overall</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{(audit.content_readiness_score ?? 0).toFixed(1)}</div>
                <div className="text-xs text-gray-500">Content</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{(audit.ai_visibility_score ?? 0).toFixed(1)}</div>
                <div className="text-xs text-gray-500">Visibility</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}