/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Mic,
  FileCheck2,
  Sliders,
  BarChart3,
  Settings,
  Bot,
  Wifi,
  WifiOff,
  User,
  LogOut,
  LogIn,
  Layers,
  Sparkles,
  ChevronDown,
  FolderGit2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Survey, AppUser } from '../types/survey';
import { SyncStatusState } from '../utils/offlineSync';

export type DashboardViewType =
  | 'dashboard'
  | 'interviews'
  | 'requirements'
  | 'surveys'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentView: DashboardViewType;
  onSelectView: (view: DashboardViewType) => void;
  surveys: Survey[];
  activeSurveyId: string;
  onSelectSurvey: (id: string) => void;
  syncStatus: SyncStatusState;
  onOpenSyncModal: () => void;
  currentUser: AppUser | null;
  onOpenLoginModal: () => void;
  onToggleCopilot: () => void;
  isChatOpen: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  surveys,
  activeSurveyId,
  onSelectSurvey,
  syncStatus,
  onOpenSyncModal,
  currentUser,
  onOpenLoginModal,
  onToggleCopilot,
  isChatOpen,
  isOpenMobile,
  onCloseMobile,
}) => {
  const activeSurvey = surveys.find(s => s.id === activeSurveyId) || surveys[0];

  const navItems = [
    {
      id: 'dashboard' as DashboardViewType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      id: 'interviews' as DashboardViewType,
      label: 'Interviews & Sessions',
      icon: Mic,
      badge: null,
    },
    {
      id: 'requirements' as DashboardViewType,
      label: 'Requirements Matrix',
      icon: FileCheck2,
      badge: 'AI Synced',
    },
    {
      id: 'surveys' as DashboardViewType,
      label: 'Instrument Builder',
      icon: Sliders,
      badge: null,
    },
    {
      id: 'analytics' as DashboardViewType,
      label: 'Analytics & Reports',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings' as DashboardViewType,
      label: 'Settings & Security',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (view: DashboardViewType) => {
    onSelectView(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">ReqAI</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                AI Requirements Interviewer
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Project Switcher Card */}
        <div className="p-3 mx-3 mt-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 px-1 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              Active Project
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">v{activeSurvey?.version || 1}.0</span>
          </div>
          <div className="relative">
            <select
              value={activeSurveyId}
              onChange={(e) => onSelectSurvey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-lg py-1.5 pl-2.5 pr-8 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer truncate"
            >
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 px-1 line-clamp-1">
            {activeSurvey?.targetRespondentGroup || 'General Stakeholders'}
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Main Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* AI Copilot Quick Assistant Item */}
          <div className="pt-4">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              AI Assistance
            </div>
            <button
              onClick={() => {
                onToggleCopilot();
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer border ${
                isChatOpen
                  ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span>Req Copilot</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Direct AI
              </span>
            </button>
          </div>
        </div>

        {/* Footer Area: Offline Sync + User Profile */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
          {/* Offline Sync Status Banner */}
          <button
            onClick={onOpenSyncModal}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              syncStatus.isOnline && !syncStatus.isSimulatedOffline
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300 hover:bg-emerald-950/30'
                : 'bg-amber-950/30 border-amber-800/50 text-amber-300 hover:bg-amber-950/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    syncStatus.isOnline && !syncStatus.isSimulatedOffline
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    syncStatus.isOnline && !syncStatus.isSimulatedOffline
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="text-[11px] font-semibold">
                {syncStatus.isOnline && !syncStatus.isSimulatedOffline
                  ? 'Cloud Synced'
                  : 'Offline Storage Active'}
              </span>
            </div>
            {syncStatus.pendingCount > 0 ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {syncStatus.pendingCount} queued
              </span>
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>

          {/* User Account / Profile Box */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div
              className="flex items-center gap-2.5 cursor-pointer min-w-0"
              onClick={onOpenLoginModal}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-500/20 shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser ? currentUser.name : 'Sign In / Account'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser ? currentUser.role.toUpperCase() : 'Offline Mode'}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenLoginModal}
              title={currentUser ? 'Account & Session' : 'Sign in'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/70 transition-colors cursor-pointer"
            >
              {currentUser ? <LogOut className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
