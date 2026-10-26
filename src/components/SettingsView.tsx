/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  Trash2,
  Lock,
  Wifi,
  WifiOff,
  User,
  Key,
  CheckCircle2,
} from 'lucide-react';
import { AppUser } from '../types/survey';
import { offlineSyncManager, SyncStatusState } from '../utils/offlineSync';

interface SettingsViewProps {
  currentUser: AppUser | null;
  onOpenLoginModal: () => void;
  syncStatus: SyncStatusState;
  onOpenSyncModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onOpenLoginModal,
  syncStatus,
  onOpenSyncModal,
}) => {
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const handleSimulateOffline = () => {
    offlineSyncManager.toggleSimulatedOffline();
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear your local encrypted offline cache?')) {
      localStorage.removeItem('offline_survey_responses_v1');
      setResetNotice('Local offline cache cleared successfully.');
      setTimeout(() => setResetNotice(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Toast */}
      {resetNotice && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md">
          <span>{resetNotice}</span>
          <button onClick={() => setResetNotice(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          <span>System Settings & Local Storage</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage zero-knowledge client encryption, offline synchronization behavior, and user account privileges.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Active Session & Role</span>
          </h3>
          <button
            onClick={onOpenLoginModal}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 cursor-pointer"
          >
            {currentUser ? 'Switch Account' : 'Sign In'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Account Name
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {currentUser?.name || 'Local Offline User'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Assigned Role
            </span>
            <span className="font-bold text-slate-900 dark:text-white uppercase">
              {currentUser?.role || 'Guest Interviewer'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Affiliation
            </span>
            <span className="font-bold text-slate-900 dark:text-white truncate">
              {currentUser?.institution || 'Research Ethics & Tech Lab'}
            </span>
          </div>
        </div>
      </div>

      {/* Storage & Encryption */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Storage & Encryption Architecture</span>
        </h3>

        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>AES-256 Client-Side Zero-Knowledge Storage Enabled</span>
          </div>
          <p className="leading-relaxed text-emerald-800 dark:text-emerald-300/80">
            All offline interview audio notes, Likert ratings, and participant identifiers are
            stored in encrypted browser IndexedDB storage. No plain text data leaves your browser
            unless deliberately synced.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Simulated Offline Mode
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Test offline survey interviewing and local draft persistence even when connected.
            </p>
          </div>
          <button
            onClick={handleSimulateOffline}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              syncStatus.isSimulatedOffline
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            {syncStatus.isSimulatedOffline ? 'Disable Simulation' : 'Simulate Offline'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Clear Local Cache
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Reset uncommitted local session drafts and cached instrument definitions.
            </p>
          </div>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 cursor-pointer"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};
