import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Shield, Zap, BarChart3 } from 'lucide-react';
import { User } from '@/api/entities';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.href);
      if (onLogin) onLogin();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#287de0]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#287de0]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Login Required
                </h2>
                <p className="text-gray-600">
                  Please sign in to access brand analysis features and generate detailed audit reports.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Zap className="w-4 h-4 text-[#287de0]" />
                  <span>Generate comprehensive brand audits</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4 text-[#287de0]" />
                  <span>Access detailed analytics and insights</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-[#287de0]" />
                  <span>Save and track audit history</span>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                className="w-full bg-[#287de0] hover:bg-[#1e6bc7] text-white py-3 text-lg font-medium"
              >
                Sign In with Google
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure authentication powered by Google
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}