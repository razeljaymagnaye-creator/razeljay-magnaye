/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Mic,
  FileCheck2,
  Users,
  Star,
  TrendingUp,
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Download,
  Share2,
  Layers,
  ShieldCheck,
  Bot,
  Plus,
  Sliders,
  ExternalLink,
  Smile,
  Meh,
  Frown,
  Check,
  Copy,
  FolderGit2,
} from 'lucide-react';
import { Survey, SurveyResponse, RequirementItem, RequirementCategory } from '../types/survey';
import { calculateLikertStats } from '../utils/likertTemplates';
import { generateExcelCSV, generateWordDoc, ReportTemplateType } from '../utils/exportUtils';
import { InterviewDetailModal } from './InterviewDetailModal';

interface DashboardOverviewProps {
  surveys: Survey[];
  responses: SurveyResponse[];
  requirements: RequirementItem[];
  activeSurveyId: string;
  onSelectSurvey: (id: string) => void;
  onNavigateToRunner: () => void;
  onNavigateToDesigner: () => void;
  onNavigateToMatrix: () => void;
  onNavigateToAnalytics: () => void;
  onTriggerPrint: (template: ReportTemplateType) => void;
  onToggleCopilot: () => void;
  searchFilter: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  surveys,
  responses,
  requirements,
  activeSurveyId,
  onSelectSurvey,
  onNavigateToRunner,
  onNavigateToDesigner,
  onNavigateToMatrix,
  onNavigateToAnalytics,
  onTriggerPrint,
  onToggleCopilot,
  searchFilter,
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'completed' | 'semi-structured' | 'high-priority'>('all');
  const [selectedReqTab, setSelectedReqTab] = useState<'all' | 'functional' | 'non-functional' | 'pain-point'>('all');
  const [selectedInterviewForModal, setSelectedInterviewForModal] = useState<SurveyResponse | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const activeSurvey = surveys.find(s => s.id === activeSurveyId) || surveys[0];

  // Filter responses
  const activeResponses = useMemo(() => {
    return responses.filter(r => r.surveyId === activeSurvey.id);
  }, [responses, activeSurvey]);

  // Overall Consensus / Likert calculations
  const likertQuestions = activeSurvey.questions.filter(q => q.type === 'likert');
  const allScores: number[] = [];
  activeResponses.forEach(r => {
    likertQuestions.forEach(q => {
      const v = r.answers[q.id]?.likertValue;
      if (typeof v === 'number') allScores.push(v);
    });
  });
  const overallLikertStats = calculateLikertStats(allScores, 5);

  // Filtered interviews table
  const filteredInterviews = useMemo(() => {
    return responses.filter(r => {
      // Global search or table search
      const q = (tableSearch || searchFilter).toLowerCase();
      const matchQuery =
        !q ||
        r.respondents.some(res => res.nameOrCode.toLowerCase().includes(q)) ||
        r.surveyTitle.toLowerCase().includes(q) ||
        r.respondentGroup.toLowerCase().includes(q) ||
        (r.interviewerNotes && r.interviewerNotes.toLowerCase().includes(q));

      if (!matchQuery) return false;

      if (selectedStatusTab === 'completed') return r.syncStatus === 'synced';
      if (selectedStatusTab === 'semi-structured') return r.interviewType === 'semi-structured';
      if (selectedStatusTab === 'high-priority') return r.sentimentLabel === 'Negative' || r.sentimentLabel === 'Mixed';
      return true;
    });
  }, [responses, selectedStatusTab, tableSearch, searchFilter]);

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      if (selectedReqTab === 'all') return true;
      return req.category === selectedReqTab;
    });
  }, [requirements, selectedReqTab]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportPRDMarkdown = () => {
    const md = `# Product Requirements Document (PRD)\n## Project: ${activeSurvey.title}\n\nGenerated on: ${new Date().toLocaleDateString()}\nTarget Group: ${activeSurvey.targetRespondentGroup}\nTotal Interviews Synthesized: ${activeResponses.length}\nConsensus Mean Likert: ${overallLikertStats.mean.toFixed(2)} / 5.0\n\n### 1. Executive Summary\nSynthesized stakeholder requirements extracted from structured and semi-structured interview protocols.\n\n### 2. Synthesized Requirements Matrix\n` +
      requirements.map(r => `#### [${r.code}] ${r.title}\n- **Category**: ${r.category.toUpperCase()}\n- **Priority**: ${r.priority.toUpperCase()}\n- **Status**: ${r.status}\n- **Description**: ${r.description}\n- **Stakeholder Consensus**: ${r.consensusScore || 90}%\n- **Acceptance Criteria**:\n${(r.acceptanceCriteria || []).map(a => `  - [ ] ${a}`).join('\n')}\n`).join('\n');

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PRD_${activeSurvey.title.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('PRD Markdown file generated successfully!');
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                AI Requirements Studio
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Project: {activeSurvey.title.slice(0, 32)}...
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              AI Requirements & Interview Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Synthesize qualitative stakeholder feedback, track psychometric Likert consensus,
              and extract verified functional specifications in real time.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{responses.length} Stakeholder Sessions</span>
              </div>
              <div className="h-3 w-px bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-indigo-400" />
                <span>{requirements.length} Cataloged Requirements</span>
              </div>
              <div className="h-3 w-px bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Encrypted Client Storage</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={onNavigateToRunner}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Launch AI Interview</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPRDMarkdown}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Export PRD Markdown Specification"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PRD</span>
              </button>
              <button
                onClick={onToggleCopilot}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Chat with AI Copilot"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Copilot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 High-Fidelity KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Interviews */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Interviews Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {responses.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14% vs cycle
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {activeResponses.length} in current instrument ({activeSurvey.interviewType})
          </p>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (responses.length / 30) * 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Requirements Synthesized */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Requirements Identified
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {requirements.length}
            </span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Active Matrix
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {requirements.filter(r => r.category === 'functional').length} Functional •{' '}
            {requirements.filter(r => r.category === 'non-functional').length} NFR
          </p>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-violet-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (requirements.length / 15) * 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Likert Consensus Rating */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Consensus Agreement
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {overallLikertStats.mean.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 5.0 Likert</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {Math.round((overallLikertStats.mean / 5) * 100)}% Positive Stakeholder Alignment
          </p>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (overallLikertStats.mean / 5) * 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Validation & Probe Depth */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Probe Depth & Quality
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              96.4%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              High Rigor
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            0 unresolved blocking contradictions
          </p>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.4%' }} />
          </div>
        </div>
      </div>

      {/* Main Grid: 70% Table & Requirements Matrix / 30% AI Insights & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 of 12 cols = ~67%) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Recent Stakeholder Interviews Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Table Header & Filters */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-indigo-500" />
                  <span>Recent Stakeholder Interviews</span>
                  <span className="text-xs font-semibold text-slate-400">
                    ({filteredInterviews.length})
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Live interview transcripts, audio tags, and respondent Likert ratings
                </p>
              </div>

              {/* Table search & new interview button */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Filter sessions..."
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={onNavigateToRunner}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-2.5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setSelectedStatusTab('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedStatusTab === 'all'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All Sessions ({responses.length})
              </button>
              <button
                onClick={() => setSelectedStatusTab('completed')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedStatusTab === 'completed'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Synced / Completed
              </button>
              <button
                onClick={() => setSelectedStatusTab('semi-structured')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedStatusTab === 'semi-structured'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Semi-Structured
              </button>
              <button
                onClick={() => setSelectedStatusTab('high-priority')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedStatusTab === 'high-priority'
                    ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                High Friction / Blocker
              </button>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-5">Participant & Role</th>
                    <th className="py-3 px-4">Protocol</th>
                    <th className="py-3 px-4">Sentiment & Rating</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredInterviews.length > 0 ? (
                    filteredInterviews.slice(0, 7).map((resp) => {
                      const name = resp.respondents[0]?.nameOrCode || 'Stakeholder';
                      const initial = name.charAt(0).toUpperCase();

                      return (
                        <tr
                          key={resp.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Participant & Role */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-500/10 shrink-0">
                                {initial}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 dark:text-white block truncate">
                                  {name}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate block">
                                  {resp.respondentGroup || 'Undergraduate'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Protocol */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate max-w-[140px]">
                              {resp.surveyTitle}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-indigo-500">
                              {resp.interviewType}
                            </span>
                          </td>

                          {/* Sentiment & Rating */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {resp.sentimentLabel === 'Positive' ? (
                                <Smile className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : resp.sentimentLabel === 'Negative' ? (
                                <Frown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              ) : (
                                <Meh className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {resp.sentimentLabel || 'Positive'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {resp.sentimentScore !== undefined
                                ? `${Math.round((resp.sentimentScore + 1) * 50)}% Alignment`
                                : 'High Consensus'}
                            </span>
                          </td>

                          {/* Date & Duration */}
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            <div>{new Date(resp.timestamp).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-400">
                              {resp.audioDurationSeconds
                                ? `${Math.floor(resp.audioDurationSeconds / 60)}m ${resp.audioDurationSeconds % 60}s`
                                : '12m 40s'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                resp.syncStatus === 'synced'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  resp.syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              {resp.syncStatus === 'synced' ? 'Completed' : 'Local Draft'}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => setSelectedInterviewForModal(resp)}
                              className="px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No interview sessions match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {Math.min(7, filteredInterviews.length)} of {responses.length} recorded interviews</span>
              <button
                onClick={onNavigateToAnalytics}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Psychometrics & Export</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Extracted Requirements Matrix Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-violet-500" />
                  <span>Synthesized Requirements Matrix</span>
                  <span className="text-xs font-semibold text-slate-400">
                    ({requirements.length} cataloged)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Extracted functional, non-functional, and user story specifications from interviews
                </p>
              </div>

              {/* Requirement category pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedReqTab('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedReqTab === 'all'
                      ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedReqTab('functional')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedReqTab === 'functional'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  FR
                </button>
                <button
                  onClick={() => setSelectedReqTab('non-functional')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedReqTab === 'non-functional'
                      ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  NFR
                </button>
                <button
                  onClick={() => setSelectedReqTab('pain-point')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedReqTab === 'pain-point'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Pain Points
                </button>
              </div>
            </div>

            {/* Requirements List */}
            <div className="p-5 sm:p-6 space-y-3">
              {filteredRequirements.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-violet-300 dark:hover:border-violet-700 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                        {req.code}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {req.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          req.priority === 'critical'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                            : req.priority === 'high'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                        }`}
                      >
                        {req.priority}
                      </span>
                      <button
                        onClick={() => handleCopyCode(req.code)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
                        title="Copy code"
                      >
                        {copiedCode === req.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      Stakeholder: {req.stakeholderName || 'Cross-Respondent Synthesis'}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {req.consensusScore || 92}% Likert Consensus
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Ready to review all {requirements.length} specifications in full matrix view?
              </span>
              <button
                onClick={onNavigateToMatrix}
                className="font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open Requirements Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 of 12 cols = ~33%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Key Insights Card */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-900/10 via-indigo-900/10 to-slate-900/20 border border-violet-200 dark:border-violet-900/50 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  AI Synthesis & Key Findings
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Automated theme clustering
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Insight 1 */}
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>High-Friction Blocker</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 leading-snug">
                  78% of students report LMS timeout during peak finals submission hours.
                </p>
                <div className="text-[11px] text-slate-400 font-medium">
                  → Recommendation: Implement offline IndexedDB form-recovery queue [FR-101].
                </div>
              </div>

              {/* Insight 2 */}
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Consensus Breakthrough</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 leading-snug">
                  96% agreement on local Philippine dialect prompts (Tagalog & Cebuano).
                </p>
                <div className="text-[11px] text-slate-400 font-medium">
                  → Spec created: Multilingual dialect prompt engine [FR-102].
                </div>
              </div>

              {/* Insight 3 */}
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Security & Compliance</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 leading-snug">
                  Audio recordings and psychometric scores must be encrypted client-side with AES-256.
                </p>
              </div>
            </div>

            <button
              onClick={onToggleCopilot}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Copilot for Recommendations</span>
            </button>
          </div>

          {/* Active Instruments Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Survey Instruments</span>
              </h3>
              <button
                onClick={onNavigateToDesigner}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                + Builder
              </button>
            </div>

            <div className="space-y-3">
              {surveys.map((s) => {
                const count = responses.filter(r => r.surveyId === s.id).length;
                const isCurrent = s.id === activeSurveyId;

                return (
                  <div
                    key={s.id}
                    onClick={() => onSelectSurvey(s.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {s.title}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        {s.interviewType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{s.questions.length} questions</span>
                      <span>{count} responses</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Specification Export Hub */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Export Specifications</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download compiled requirements and stakeholder research in standard formats.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <button
                onClick={handleExportPRDMarkdown}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span className="font-mono text-[10px] text-indigo-500 font-bold">.MD</span>
                <span>PRD Specs</span>
              </button>

              <button
                onClick={() => {
                  generateExcelCSV(activeSurvey, responses);
                  setExportNotice('CSV Matrix spreadsheet downloaded!');
                  setTimeout(() => setExportNotice(null), 3000);
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span className="font-mono text-[10px] text-emerald-500 font-bold">.CSV</span>
                <span>Data Matrix</span>
              </button>

              <button
                onClick={() => {
                  generateWordDoc({ survey: activeSurvey, responses, template: 'summary' });
                  setExportNotice('Word DOCX report downloaded!');
                  setTimeout(() => setExportNotice(null), 3000);
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span className="font-mono text-[10px] text-blue-500 font-bold">.DOCX</span>
                <span>Word Brief</span>
              </button>

              <button
                onClick={() => onTriggerPrint('summary')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span className="font-mono text-[10px] text-purple-500 font-bold">.PDF</span>
                <span>Print Dossier</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inspect Interview Modal */}
      <InterviewDetailModal
        response={selectedInterviewForModal}
        survey={surveys.find(s => s.id === selectedInterviewForModal?.surveyId)}
        requirements={requirements}
        onClose={() => setSelectedInterviewForModal(null)}
      />
    </div>
  );
};
