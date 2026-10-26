/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  Lock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';
import { offlineSyncManager, SyncStatusState } from '../utils/offlineSync';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>(offlineSyncManager.getStatus());
  const [queueItems, setQueueItems] = useState<any[]>(offlineSyncManager.getPendingQueue());
  const [conflicts, setConflicts] = useState<any[]>(offlineSyncManager.getConflicts());
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = offlineSyncManager.subscribe(status => {
      setSyncStatus(status);
      setQueueItems(offlineSyncManager.getPendingQueue());
      setConflicts(offlineSyncManager.getConflicts());
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerSync = async () => {
    setIsManualSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await offlineSyncManager.syncNow();
      setQueueItems(offlineSyncManager.getPendingQueue());
      setConflicts(offlineSyncManager.getConflicts());
      setSyncFeedback(`Successfully synchronized ${res.syncedCount} queued survey records.`);
    } catch (err) {
      console.error('Manual sync failed:', err);
      setSyncFeedback('Sync attempt halted. Check connectivity.');
    } finally {
      setIsManualSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Offline Security & Central Auto-Sync Engine
              </h3>
              <p className="text-xs text-slate-500">
                Encrypted local resilience, auto-reconciliation, and conflict resolution logs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-base font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Sync Status Feedback Toast */}
        {syncFeedback && (
          <div className="bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-xs font-semibold flex items-center justify-between">
            <span>{syncFeedback}</span>
            <button onClick={() => setSyncFeedback(null)} className="underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Status Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Network Modality</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
              {syncStatus.isSimulatedOffline ? (
                <>
                  <WifiOff className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Field Offline Simulation</span>
                </>
              ) : syncStatus.isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Connected Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-600 dark:text-rose-400">Offline (No Network)</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Pending Upload Queue</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
              <Database className="w-4 h-4 text-blue-500" />
              <span>{syncStatus.pendingCount} Submissions Queued</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Local Encryption</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>AES-GCM Web Crypto</span>
            </div>
          </div>
        </div>

        {/* Actions & Offline Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Simulate Field Disconnection (Test Offline Answering)
            </span>
            <p className="text-[11px] text-slate-500">
              Cut connection to test how respondents can answer without internet and sync automatically later.
            </p>
          </div>

          <button
            onClick={() => offlineSyncManager.toggleSimulatedOffline()}
            className={`text-xs px-3.5 py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
              syncStatus.isSimulatedOffline
                ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-500'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
            }`}
          >
            {syncStatus.isSimulatedOffline ? 'Reconnect (Exit Offline)' : 'Simulate Offline'}
          </button>
        </div>

        {/* Queued Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 dark:text-white">
              Queued Encrypted Payloads ({queueItems.length})
            </span>
            {queueItems.length > 0 && (
              <button
                onClick={handleTriggerSync}
                disabled={isManualSyncing || !syncStatus.isOnline}
                className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isManualSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Queue Now</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {queueItems.length > 0 ? (
              queueItems.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.responseSummary?.surveyTitle || 'Survey Response'}
                    </span>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Payload ID: {item.id} • Queued: {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded">
                    ENCRYPTED
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <span>All local survey submissions are synchronized with the central server.</span>
              </div>
            )}
          </div>
        </div>

        {/* Conflict Resolution Logs (Requirement 7) */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Conflict Resolution Engine</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Strategy: <strong>Latest Timestamp Wins & Answers Merged</strong>
            </span>
          </div>

          {conflicts.length > 0 ? (
            <div className="space-y-1.5 text-xs max-h-32 overflow-y-auto pr-1">
              {conflicts.map((c, idx) => (
                <div key={idx} className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-[11px]">
                  <strong>Record #{c.id}:</strong> {c.resolution} at {new Date(c.serverTimestamp).toLocaleTimeString()}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic">
              Zero concurrent conflicts detected. Multi-device sync is aligned.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
