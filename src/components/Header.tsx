/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Menu,
  Search,
  Plus,
  Globe,
  Bot,
  Sparkles,
  Wifi,
  WifiOff,
  Bell,
  Sliders,
  FileCheck2,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { SyncStatusState } from '../utils/offlineSync';
import { DashboardViewType } from './Sidebar';

interface HeaderProps {
  currentView: DashboardViewType;
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStartNewInterview: () => void;
  onNewSurvey: () => void;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  syncStatus: SyncStatusState;
  onOpenSyncModal: () => void;
  onToggleCopilot: () => void;
  isChatOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
  onStartNewInterview,
  onNewSurvey,
  currentLanguage,
  setCurrentLanguage,
  syncStatus,
  onOpenSyncModal,
  onToggleCopilot,
  isChatOpen,
}) => {
  const viewTitles: Record<DashboardViewType, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'AI Requirements & Interview Synthesis',
    },
    interviews: {
      title: 'Interview Studio',
      subtitle: 'Conduct Structured & Semi-Structured Sessions',
    },
    requirements: {
      title: 'Requirements Matrix',
      subtitle: 'Functional, Non-Functional & User Stories',
    },
    surveys: {
      title: 'Instrument Builder',
      subtitle: 'Psychometric & Survey Design Studio',
    },
    analytics: {
      title: 'Analytics & Reports',
      subtitle: 'Consensus Metrics & Multi-Format Export',
    },
    settings: {
      title: 'Settings & Storage',
      subtitle: 'Offline Cache & Local Encryption',
    },
  };

  const currentMeta = viewTitles[currentView] || viewTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">ReqAI</span>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-200 capitalize">{currentMeta.title}</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {currentMeta.title}
            </h1>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search requirements, interviews, or stakeholders... (⌘K)"
              className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-14 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 bg-white dark:bg-slate-900">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right Side: Quick Actions, Language, and Copilot */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {lang.code.toUpperCase()} - {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* AI Copilot Button */}
          <button
            onClick={onToggleCopilot}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              isChatOpen
                ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/20'
                : 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/60 hover:bg-violet-100'
            }`}
            title="Open AI Requirements Copilot"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* New Instrument Button */}
          <button
            onClick={onNewSurvey}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Create New Survey Instrument"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>New Instrument</span>
          </button>

          {/* Primary CTA: Start Interview */}
          <button
            onClick={onStartNewInterview}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/25 transition-all cursor-pointer active:scale-95"
            title="Start new interview session"
          >
            <Plus className="w-4 h-4" />
            <span>Start Interview</span>
          </button>
        </div>
      </div>
    </header>
  );
};
