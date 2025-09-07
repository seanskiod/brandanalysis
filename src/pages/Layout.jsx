
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, Home, Briefcase, HelpCircle, LogIn, LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "./components/hooks/useAuth";
import LoginModal from "./components/auth/LoginModal";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4dc2370fc_BrandRankLogo.png"
                  alt="BrandRank.AI"
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BrandRank.AI</h1>
                <p className="text-xs -mt-1 text-gray-500">Internal Brand Auditing Software</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {user.full_name || user.email}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : !isLoading && (
                <Button variant="ghost" size="sm" onClick={handleLoginClick} className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              )}

              {/* Main Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <span className="text-gray-700">Menu</span>
                    <ChevronDown className="w-4 h-4 text-gray-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Home")} className="flex items-center gap-2 hover:text-blue-600 hover:bg-blue-50">
                      <Home className="w-4 h-4 hover:text-blue-600" />
                      Brand Audit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Industry")} className="flex items-center gap-2 hover:text-blue-600 hover:bg-blue-50">
                      <Briefcase className="w-4 h-4 hover:text-blue-600" />
                      Industry Rankings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("HowItWorks")} className="flex items-center gap-2 hover:text-blue-600 hover:bg-blue-50">
                      <HelpCircle className="w-4 h-4 hover:text-blue-600" />
                      How It Works
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4dc2370fc_BrandRankLogo.png"
                  alt="BrandRank.AI"
                  className="w-6 h-6"
                />
              </div>
              <span className="text-lg font-semibold text-gray-900">BrandRank.AI</span>
            </div>
            <p className="text-sm text-gray-600">
              Leading the future of AI search visibility analytics
            </p>
            <p className="text-xs mt-2 text-gray-400">
              © 2025 BrandRank.AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => setShowLoginModal(false)}
      />
    </div>
  );
}
