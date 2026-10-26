/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  CheckCircle2,
  Building,
  KeyRound,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import { AppUser, UserRole } from '../types/survey';
import { authManager, PRESET_DEMO_ACCOUNTS } from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('interviewer');
  const [institution, setInstitution] = useState('Western Philippines University');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const result = await authManager.login(email, password);
      if (result.success) {
        setSuccessMessage(`Welcome back, ${result.user?.name}!`);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const result = await authManager.register(email, password, name, role, institution);
      if (result.success) {
        setSuccessMessage(`Account created successfully! Logged in as ${result.user?.name}.`);
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        setErrorMessage(result.error || 'Registration failed.');
      }
    } catch {
      setErrorMessage('An error occurred during account registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    const res = await authManager.login(demoEmail, demoPass);
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(`Logged in as ${res.user?.name}`);
      setTimeout(() => onClose(), 500);
    } else {
      setErrorMessage(res.error || 'Failed to login demo account.');
    }
  };

  const handleLogout = () => {
    authManager.logout();
    setSuccessMessage('Successfully logged out.');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    authManager.switchRole(newRole);
    setSuccessMessage(`Switched role to ${newRole.toUpperCase()}`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const getRoleBadgeColor = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'interviewer':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'analyst':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {currentUser ? 'User Profile & Account' : 'Survey Instrument Sign In'}
              </h3>
              <p className="text-[11px] text-slate-400">
                100% Offline Capable • Encrypted Local Vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VIEW 1: CURRENT USER PROFILE (LOGGED IN) */}
          {currentUser ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center gap-3">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center">
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getRoleBadgeColor(currentUser.role)}`}>
                        {currentUser.role}
                      </span>
                      {currentUser.institution && (
                        <span className="text-[10px] text-slate-400 truncate">
                          {currentUser.institution}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Quick Role Test Switcher:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['admin', 'interviewer', 'analyst'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSwitch(r)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border capitalize cursor-pointer transition-colors ${
                          currentUser.role === r
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* VIEW 2: LOGIN OR REGISTER FORM */
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage(null);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Register Account
                </button>
              </div>

              {/* 1-Click Fast Demo Login Buttons */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Quick 1-Click Sign-in:
                </span>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  {PRESET_DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(acc.email, acc.passwordHash)}
                      className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-lg flex items-center justify-between text-left cursor-pointer transition-colors shadow-2xs group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] block truncate">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {acc.email}
                        </span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 border ${getRoleBadgeColor(acc.role)}`}>
                        {acc.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Login Form */}
              {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. razeljay_magnaye@wpu.edu.ph"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Demo password for preloaded accounts is <code>password123</code>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                  </button>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john.doe@organization.org"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="interviewer">Interviewer</option>
                        <option value="analyst">Data Analyst</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. WPU Research"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isLoading ? 'Creating Account...' : 'Register & Log In'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
