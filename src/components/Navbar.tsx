/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Edit3,
  BarChart3,
  Bot,
  Plus,
  Globe,
  Wifi,
  WifiOff,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Survey } from '../types/survey';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { offlineSyncManager, SyncStatusState } from '../utils/offlineSync';

import { AppUser } from '../types/survey';
import { User, LogIn, LogOut } from 'lucide-react';

export type SimpleTab = 'take' | 'edit' | 'results';

interface NavbarProps {
  activeTab: SimpleTab;
  setActiveTab: (tab: SimpleTab) => void;
  surveys: Survey[];
  activeSurveyId: string;
  setActiveSurveyId: (id: string) => void;
  onNewSurvey: () => void;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  openSyncModal: () => void;
  onToggleCopilot: () => void;
  isChatOpen: boolean;
  currentUser: AppUser | null;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  surveys,
  activeSurveyId,
  setActiveSurveyId,
  onNewSurvey,
  currentLanguage,
  setCurrentLanguage,
  openSyncModal,
  onToggleCopilot,
  isChatOpen,
  currentUser,
  onOpenLoginModal,
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>(offlineSyncManager.getStatus());

  useEffect(() => {
    const unsub = offlineSyncManager.subscribe(status => setSyncStatus(status));
    return () => unsub();
  }, []);

  const activeSurvey = surveys.find(s => s.id === activeSurveyId) || surveys[0];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs">
      {/* Offline banner (only when actually offline) */}
      {(!syncStatus.isOnline || syncStatus.isSimulatedOffline) && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>Offline Mode Active — Surveys are saved locally and will auto-sync when reconnected.</span>
          </div>
          <button
            onClick={() => offlineSyncManager.toggleSimulatedOffline()}
            className="underline hover:text-amber-100 text-xs font-semibold cursor-pointer"
          >
            {syncStatus.isSimulatedOffline ? 'Go Online' : 'Dismiss'}
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Active Survey Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Survey
              </span>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {/* Clean Survey Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 px-2.5 max-w-[200px] sm:max-w-xs">
              <select
                value={activeSurveyId}
                onChange={(e) => setActiveSurveyId(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate max-w-[130px] sm:max-w-[180px]"
                title="Select active survey"
              >
                {surveys.map(s => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {s.title}
                  </option>
                ))}
              </select>
              <button
                onClick={onNewSurvey}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-md font-medium flex items-center gap-0.5 shrink-0 cursor-pointer"
                title="Create a new survey"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New</span>
              </button>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-slate-300">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
                title="Change language"
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Offline Status Indicator */}
            <button
              onClick={openSyncModal}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              title="Sync & Offline Status"
            >
              {syncStatus.isSyncing ? (
                <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
              ) : syncStatus.pendingCount > 0 ? (
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
              <span className="hidden sm:inline font-medium">
                {syncStatus.pendingCount > 0 ? `${syncStatus.pendingCount} Saved` : 'Offline Ready'}
              </span>
            </button>

            {/* AI Copilot / Chat */}
            <button
              onClick={onToggleCopilot}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                isChatOpen
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800'
              }`}
              title="Open AI Survey Copilot"
            >
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Ask AI</span>
            </button>

            {/* User Profile / Log In */}
            {currentUser ? (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title={`Logged in as ${currentUser.name}. Click to switch role or log out.`}
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Simple Tabs */}
        <div className="flex border-t border-slate-100 dark:border-slate-800/80 -mb-px">
          <button
            onClick={() => setActiveTab('take')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'take'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Take Survey</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'edit'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Questions</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-slate-500">
              {activeSurvey.questions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`py-3 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'results'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Results</span>
          </button>
        </div>
      </div>
    </header>
  );
};
