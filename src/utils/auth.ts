/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppUser, UserRole } from '../types/survey';

const CURRENT_USER_KEY = 'ai_survey_current_user_v1';
const USERS_VAULT_KEY = 'ai_survey_users_vault_v1';

// Initial pre-configured accounts (works 100% offline)
const DEFAULT_ACCOUNTS: Array<AppUser & { passwordHash: string }> = [
  {
    id: 'usr_admin_01',
    email: 'razeljay_magnaye@wpu.edu.ph',
    name: 'Dr. Razel Jay Magnaye',
    role: 'admin',
    institution: 'Western Philippines University (WPU)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    passwordHash: 'password123',
    createdAt: '2026-08-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr_interviewer_02',
    email: 'field.interviewer@wpu.edu.ph',
    name: 'Maria Santos (Field Lead)',
    role: 'interviewer',
    institution: 'Palawan Rural Field Unit',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    passwordHash: 'interviewer123',
    createdAt: '2026-09-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr_analyst_03',
    email: 'analyst@wpu.edu.ph',
    name: 'Carlo Mendoza (Statistician)',
    role: 'analyst',
    institution: 'Research & Statistical Center',
    passwordHash: 'analyst123',
    createdAt: '2026-09-15T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
];

type AuthListener = (user: AppUser | null) => void;

class AuthManager {
  private listeners: Set<AuthListener> = new Set();
  private currentUser: AppUser | null = null;

  constructor() {
    this.initVault();
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch {
        this.currentUser = DEFAULT_ACCOUNTS[0];
      }
    } else {
      // Default auto-login to Admin account for seamless experience
      this.currentUser = {
        id: DEFAULT_ACCOUNTS[0].id,
        email: DEFAULT_ACCOUNTS[0].email,
        name: DEFAULT_ACCOUNTS[0].name,
        role: DEFAULT_ACCOUNTS[0].role,
        institution: DEFAULT_ACCOUNTS[0].institution,
        avatar: DEFAULT_ACCOUNTS[0].avatar,
        createdAt: DEFAULT_ACCOUNTS[0].createdAt,
        lastLogin: new Date().toISOString(),
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
    }
  }

  private initVault() {
    if (!localStorage.getItem(USERS_VAULT_KEY)) {
      localStorage.setItem(USERS_VAULT_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    }
  }

  private getUsersVault(): Array<AppUser & { passwordHash: string }> {
    try {
      return JSON.parse(localStorage.getItem(USERS_VAULT_KEY) || '[]');
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  }

  public subscribe(fn: AuthListener): () => void {
    this.listeners.add(fn);
    fn(this.currentUser);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.currentUser));
  }

  public getCurrentUser(): AppUser | null {
    return this.currentUser;
  }

  public async login(email: string, password: string): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    const vault = this.getUsersVault();
    const cleanEmail = email.trim().toLowerCase();

    const matched = vault.find(u => u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      return { success: false, error: 'User account with this email not found.' };
    }

    if (matched.passwordHash !== password.trim()) {
      return { success: false, error: 'Incorrect password. Try "password123".' };
    }

    const appUser: AppUser = {
      id: matched.id,
      email: matched.email,
      name: matched.name,
      role: matched.role,
      institution: matched.institution,
      avatar: matched.avatar,
      createdAt: matched.createdAt,
      lastLogin: new Date().toISOString(),
    };

    this.currentUser = appUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(appUser));
    this.notify();

    return { success: true, user: appUser };
  }

  public async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = 'interviewer',
    institution = 'Research Field Office'
  ): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    const vault = this.getUsersVault();
    const cleanEmail = email.trim().toLowerCase();

    if (vault.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: AppUser & { passwordHash: string } = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: name.trim() || 'Research Member',
      role,
      institution,
      passwordHash: password.trim(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    vault.push(newUser);
    localStorage.setItem(USERS_VAULT_KEY, JSON.stringify(vault));

    const appUser: AppUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      institution: newUser.institution,
      createdAt: newUser.createdAt,
      lastLogin: newUser.lastLogin,
    };

    this.currentUser = appUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(appUser));
    this.notify();

    return { success: true, user: appUser };
  }

  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem(CURRENT_USER_KEY);
    this.notify();
  }

  public switchRole(role: UserRole): void {
    if (!this.currentUser) return;
    this.currentUser = { ...this.currentUser, role };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
    this.notify();
  }
}

export const authManager = new AuthManager();
export const PRESET_DEMO_ACCOUNTS = DEFAULT_ACCOUNTS;
