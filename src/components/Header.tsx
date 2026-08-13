import React from 'react';
import { Sparkles, LayoutDashboard, FileText, Palette, Play, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentTab: 'landing' | 'optimize' | 'dashboard' | 'saved' | 'templates';
  onNavigate: (tab: 'landing' | 'optimize' | 'dashboard' | 'saved' | 'templates') => void;
  onTryDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, onTryDemo }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')} 
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:bg-blue-700 transition-colors">
            AO
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 tracking-tight text-base">CV Optimizer</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded">AI ATS</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('optimize')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'optimize'
                ? 'bg-slate-100 text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Optimize CV</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-slate-100 text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('saved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'saved'
                ? 'bg-slate-100 text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Tailored CVs</span>
          </button>

          <button
            onClick={() => onNavigate('templates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'templates'
                ? 'bg-slate-100 text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Templates</span>
          </button>

          {/* Demo Button */}
          <button
            onClick={onTryDemo}
            className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Try Demo</span>
          </button>
        </nav>

      </div>
    </header>
  );
};

