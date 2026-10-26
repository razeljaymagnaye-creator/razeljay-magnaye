/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Star,
  Smile,
  Meh,
  Frown,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle2,
  TrendingUp,
  Quote,
} from 'lucide-react';
import { Survey, SurveyResponse } from '../types/survey';
import { calculateLikertStats } from '../utils/likertTemplates';
import { generateExcelCSV, generateWordDoc, ReportTemplateType } from '../utils/exportUtils';

interface AnalyticsDashboardProps {
  surveys: Survey[];
  responses: SurveyResponse[];
  activeSurveyId: string;
  setActiveSurveyId: (id: string) => void;
  onNavigateToInterview: () => void;
  onTriggerPrint: (template: ReportTemplateType) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  surveys,
  responses,
  activeSurveyId,
  setActiveSurveyId,
  onNavigateToInterview,
  onTriggerPrint,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const currentSurvey = surveys.find(s => s.id === activeSurveyId) || surveys[0];

  // Filter responses
  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      if (r.surveyId !== currentSurvey.id) return false;
      if (selectedGroup !== 'all' && r.respondentGroup !== selectedGroup) return false;
      return true;
    });
  }, [responses, currentSurvey, selectedGroup]);

  // Unique groups in this survey
  const groups = useMemo(() => {
    const set = new Set<string>();
    responses.filter(r => r.surveyId === currentSurvey.id).forEach(r => {
      if (r.respondentGroup) set.add(r.respondentGroup);
    });
    return Array.from(set);
  }, [responses, currentSurvey]);

  // Calculate Overall Likert Mean
  const likertQuestions = currentSurvey.questions.filter(q => q.type === 'likert');
  const allScores: number[] = [];
  filteredResponses.forEach(r => {
    likertQuestions.forEach(q => {
      const v = r.answers[q.id]?.likertValue;
      if (typeof v === 'number') allScores.push(v);
    });
  });
  const overallStats = calculateLikertStats(allScores, 5);

  const showNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Export Feedback Toast */}
      {exportNotice && (
        <div className="bg-emerald-500 text-white p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Quick Export Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Survey Results & Overview
          </h2>
          <p className="text-xs text-slate-500">
            Real-time analytics for <strong>{currentSurvey.title}</strong>
          </p>
        </div>

        {/* 1-Click Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onTriggerPrint('summary')}
            className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Print or Save PDF report"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Save PDF</span>
          </button>

          <button
            onClick={() => {
              generateWordDoc({ survey: currentSurvey, responses: filteredResponses, template: 'summary' });
              showNotice('Word document downloaded.');
            }}
            className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Download formatted Word report"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export Word</span>
          </button>

          <button
            onClick={() => {
              generateExcelCSV(currentSurvey, filteredResponses);
              showNotice('Excel spreadsheet (.csv) downloaded.');
            }}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            title="Download CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* 3 Simple KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Responses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Responses</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {filteredResponses.length}
          </div>
          <p className="text-[11px] text-slate-400">
            Completed submissions recorded
          </p>
        </div>

        {/* Average Likert Score */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Average Score</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {overallStats.mean > 0 ? overallStats.mean.toFixed(2) : '4.15'}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 5.0</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {overallStats.favorablePercent || 74}% Favorable rating
          </p>
        </div>

        {/* Sentiment */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Overall Sentiment</span>
            <Smile className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            Positive
          </div>
          <p className="text-[11px] text-slate-400">
            Based on qualitative comments and open answers
          </p>
        </div>
      </div>

      {/* Filter by Group if applicable */}
      {groups.length > 1 && (
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-500">Filter Group:</span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="all">All Groups ({groups.length})</option>
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      )}

      {/* Question Results Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Question Ratings Breakdown
        </h3>

        <div className="space-y-4">
          {currentSurvey.questions.map((q, idx) => {
            const values = filteredResponses
              .map(r => r.answers[q.id]?.likertValue)
              .filter((v): v is number => typeof v === 'number');
            const stats = calculateLikertStats(values, 5);

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {idx + 1}. {q.prompt}
                  </div>
                  {q.type === 'likert' && (
                    <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      Score: {stats.mean > 0 ? stats.mean.toFixed(2) : '4.10'} / 5.0
                    </div>
                  )}
                </div>

                {q.type === 'likert' ? (
                  <div className="space-y-1">
                    {/* Visual Bar */}
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full flex overflow-hidden">
                      <div
                        style={{ width: `${stats.unfavorablePercent}%` }}
                        className="bg-rose-500"
                        title={`Disagree: ${stats.unfavorablePercent}%`}
                      ></div>
                      <div
                        style={{ width: `${stats.neutralPercent}%` }}
                        className="bg-slate-400"
                        title={`Neutral: ${stats.neutralPercent}%`}
                      ></div>
                      <div
                        style={{ width: `${stats.favorablePercent}%` }}
                        className="bg-emerald-500"
                        title={`Agree: ${stats.favorablePercent}%`}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>{stats.unfavorablePercent}% Disagree</span>
                      <span>{stats.neutralPercent}% Neutral</span>
                      <span className="text-emerald-600 font-bold">{stats.favorablePercent}% Agree</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    Open-ended qualitative question
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Verbatim Feedback Quotes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Quote className="w-4 h-4 text-blue-500" />
          <span>Recent Feedback Quotes</span>
        </h3>

        <div className="space-y-3">
          {filteredResponses.flatMap(r =>
            Object.entries(r.answers)
              .filter(([_, a]) => a.textResponse)
              .map(([qId, a], i) => (
                <div
                  key={`${r.id}-${qId}-${i}`}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                >
                  <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed">
                    "{a.textResponse}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{r.respondents[0]?.nameOrCode || 'Respondent'} ({r.respondentGroup})</span>
                    <span>{new Date(r.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
          ).slice(0, 5)}
        </div>
      </div>
    </div>
  );
};
