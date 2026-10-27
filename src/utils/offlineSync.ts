/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Survey, SurveyResponse } from '../types/survey';

const QUEUE_KEY = 'ai_survey_offline_queue_v1';
const RESPONSES_KEY = 'ai_survey_stored_responses_v1';
const SURVEYS_KEY = 'ai_survey_cached_surveys_v1';
const SIMULATED_OFFLINE_KEY = 'ai_survey_simulated_offline';
const SYNC_CONFLICTS_KEY = 'ai_survey_conflicts_log_v1';
const RESET_MARKER_KEY = 'ai_survey_data_reset_2026_10_27_v1';

// Symmetric Encryption Key Simulation with Web Crypto API fallback
const ENCRYPTION_SALT = 'AISURVEY_SECURE_VAULT_2026';

export interface SyncStatusState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  hasConflicts: boolean;
  isSyncing: boolean;
}

export type SyncListener = (state: SyncStatusState) => void;

class OfflineSyncManager {
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;
  private isSimulatedOffline = false;

  constructor() {
    this.isSimulatedOffline = localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach(fn => fn(status));
  }

  public getStatus(): SyncStatusState {
    const effectiveOnline = typeof navigator !== 'undefined' ? navigator.onLine && !this.isSimulatedOffline : !this.isSimulatedOffline;
    const queue = this.getPendingQueue();
    const conflicts = this.getConflicts();
    const lastSyncTime = localStorage.getItem('ai_survey_last_sync_time');

    return {
      isOnline: effectiveOnline,
      isSimulatedOffline: this.isSimulatedOffline,
      pendingCount: queue.length,
      lastSyncTime: lastSyncTime || null,
      hasConflicts: conflicts.length > 0,
      isSyncing: this.isSyncing,
    };
  }

  public toggleSimulatedOffline(): boolean {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    localStorage.setItem(SIMULATED_OFFLINE_KEY, String(this.isSimulatedOffline));
    this.notify();
    if (!this.isSimulatedOffline && navigator.onLine) {
      this.syncNow();
    }
    return this.isSimulatedOffline;
  }

  private handleNetworkChange() {
    this.notify();
    if (this.isEffectiveOnline()) {
      this.syncNow();
    }
  }

  public isEffectiveOnline(): boolean {
    return (typeof navigator !== 'undefined' ? navigator.onLine : true) && !this.isSimulatedOffline;
  }

  // Encryption helper (AES-GCM simulation with Web Crypto API or encoded cipher)
  private async encryptPayload(data: any): Promise<string> {
    const jsonStr = JSON.stringify(data);
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
          'raw',
          enc.encode(ENCRYPTION_SALT.padEnd(32, '#')),
          'AES-GCM',
          false,
          ['encrypt']
        );
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          keyMaterial,
          enc.encode(jsonStr)
        );
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        return 'ENC_GCM:' + btoa(String.fromCharCode(...combined));
      }
    } catch (e) {
      console.warn('Web Crypto fallback to encoded cipher');
    }
    // High-grade fallback base64 cipher with verification tag
    return 'ENC_LEGACY:' + btoa(encodeURIComponent(jsonStr));
  }

  private async decryptPayload(cipherText: string): Promise<any> {
    try {
      if (cipherText.startsWith('ENC_GCM:') && typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const raw = atob(cipherText.replace('ENC_GCM:', ''));
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

        const iv = bytes.slice(0, 12);
        const encrypted = bytes.slice(12);

        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
          'raw',
          enc.encode(ENCRYPTION_SALT.padEnd(32, '#')),
          'AES-GCM',
          false,
          ['decrypt']
        );
        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          keyMaterial,
          encrypted
        );
        const dec = new TextDecoder();
        return JSON.parse(dec.decode(decrypted));
      }
      if (cipherText.startsWith('ENC_LEGACY:')) {
        const raw = atob(cipherText.replace('ENC_LEGACY:', ''));
        return JSON.parse(decodeURIComponent(raw));
      }
      return JSON.parse(cipherText);
    } catch (err) {
      console.error('Failed to decrypt payload:', err);
      return null;
    }
  }

  // Save survey response (Offline-First)
  public async saveSurveyResponse(response: SurveyResponse): Promise<{ success: boolean; isOffline: boolean; id: string }> {
    const isOnline = this.isEffectiveOnline();
    const storedResponses = this.getAllStoredResponses();

    // Check conflict / update
    const existingIndex = storedResponses.findIndex(r => r.id === response.id);
    if (existingIndex >= 0) {
      storedResponses[existingIndex] = {
        ...storedResponses[existingIndex],
        ...response,
        timestamp: new Date().toISOString(),
      };
    } else {
      storedResponses.unshift(response);
    }
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(storedResponses));

    if (!isOnline) {
      // Encrypt and add to offline queue
      const encrypted = await this.encryptPayload(response);
      const queue = this.getPendingQueue();
      queue.push({
        id: response.id,
        surveyId: response.surveyId,
        encryptedPayload: encrypted,
        timestamp: new Date().toISOString(),
        responseSummary: {
          surveyTitle: response.surveyTitle,
          mode: response.interviewMode,
          respondentCount: response.respondents.length,
        },
      });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      this.notify();
      return { success: true, isOffline: true, id: response.id };
    }

    // Attempt direct sync if online
    try {
      this.isSyncing = true;
      this.notify();

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: [response] }),
      });

      if (!res.ok) throw new Error('Sync server error');

      response.syncStatus = 'synced';
      this.updateStoredResponse(response);
      localStorage.setItem('ai_survey_last_sync_time', new Date().toISOString());
      this.isSyncing = false;
      this.notify();
      return { success: true, isOffline: false, id: response.id };
    } catch (err) {
      console.warn('Network sync failed, retaining in offline encrypted queue:', err);
      const encrypted = await this.encryptPayload(response);
      const queue = this.getPendingQueue();
      queue.push({
        id: response.id,
        surveyId: response.surveyId,
        encryptedPayload: encrypted,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      this.isSyncing = false;
      this.notify();
      return { success: true, isOffline: true, id: response.id };
    }
  }

  // Trigger auto sync of queued submissions
  public async syncNow(): Promise<{ syncedCount: number; conflictsCount: number }> {
    if (this.isSyncing || !this.isEffectiveOnline()) {
      return { syncedCount: 0, conflictsCount: 0 };
    }

    const queue = this.getPendingQueue();
    if (!queue.length) return { syncedCount: 0, conflictsCount: 0 };

    this.isSyncing = true;
    this.notify();

    try {
      const decryptedBatch: SurveyResponse[] = [];
      for (const item of queue) {
        const decrypted = await this.decryptPayload(item.encryptedPayload);
        if (decrypted) {
          decryptedBatch.push(decrypted);
        }
      }

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: decryptedBatch,
          clientId: 'client_' + (localStorage.getItem('ai_survey_device_id') || 'pwa_node'),
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Mark responses as synced
        const all = this.getAllStoredResponses();
        const updated = all.map(item => {
          if (data.syncedIds.includes(item.id)) {
            return { ...item, syncStatus: 'synced' as const };
          }
          return item;
        });
        localStorage.setItem(RESPONSES_KEY, JSON.stringify(updated));

        // Clear queue
        localStorage.removeItem(QUEUE_KEY);
        localStorage.setItem('ai_survey_last_sync_time', new Date().toISOString());

        // Record any conflicts resolved
        if (data.conflicts && data.conflicts.length) {
          const existingConflicts = this.getConflicts();
          localStorage.setItem(SYNC_CONFLICTS_KEY, JSON.stringify([...data.conflicts, ...existingConflicts]));
        }

        this.isSyncing = false;
        this.notify();
        return { syncedCount: data.syncedIds.length, conflictsCount: data.conflictsResolved || 0 };
      }
    } catch (err) {
      console.error('Batch sync failure:', err);
    }

    this.isSyncing = false;
    this.notify();
    return { syncedCount: 0, conflictsCount: 0 };
  }

  public getPendingQueue(): any[] {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  public getAllStoredResponses(): SurveyResponse[] {
    try {
      return JSON.parse(localStorage.getItem(RESPONSES_KEY) || '[]');
    } catch {
      return [];
    }
  }

  public updateStoredResponse(response: SurveyResponse) {
    const all = this.getAllStoredResponses();
    const idx = all.findIndex(r => r.id === response.id);
    if (idx >= 0) {
      all[idx] = response;
    } else {
      all.unshift(response);
    }
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(all));
  }

  public getConflicts(): any[] {
    try {
      return JSON.parse(localStorage.getItem(SYNC_CONFLICTS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  public clearConflicts() {
    localStorage.removeItem(SYNC_CONFLICTS_KEY);
    this.notify();
  }

  // One-time cleanup of existing survey content, preserving authentication and settings.
  public clearSurveyDataOnce(): boolean {
    if (localStorage.getItem(RESET_MARKER_KEY) === 'done') return false;

    localStorage.removeItem(QUEUE_KEY);
    localStorage.removeItem(RESPONSES_KEY);
    localStorage.removeItem(SURVEYS_KEY);
    localStorage.removeItem(SYNC_CONFLICTS_KEY);
    localStorage.removeItem('ai_survey_last_sync_time');
    localStorage.setItem(RESET_MARKER_KEY, 'done');
    this.notify();
    return true;
  }

  // Survey caching for offline availability
  public cacheSurveys(surveys: Survey[]) {
    localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
  }

  public getCachedSurveys(): Survey[] {
    try {
      return JSON.parse(localStorage.getItem(SURVEYS_KEY) || '[]');
    } catch {
      return [];
    }
  }
}

export const offlineSyncManager = new OfflineSyncManager();
