/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  User,
  Clock,
  Mic,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  FileText,
  Star,
  Quote,
  Layers,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';
import { SurveyResponse, Survey } from '../types/survey';
import { RequirementItem } from '../types/survey';

interface InterviewDetailModalProps {
  response: SurveyResponse | null;
  survey: Survey | undefined;
  requirements: RequirementItem[];
  onClose: () => void;
  onNavigateToRunner?: () => void;
}

export const InterviewDetailModal: React.FC<InterviewDetailModalProps> = ({
  response,
  survey,
  requirements,
  onClose,
}) => {
  if (!response) return null;

  const respondentName = response.respondents.map(r => r.nameOrCode).join(', ') || 'Anonymous Stakeholder';
  const respondentRole = response.respondentGroup || 'Stakeholder';
  const relatedRequirements = requirements.filter(
    r => r.sourceInterviewId === response.id || r.surveyId === response.surveyId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
              {respondentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {respondentName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wide">
                  {response.interviewType}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  response.syncStatus === 'synced'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                }`}>
                  {response.syncStatus === 'synced' ? 'Synced' : 'Local Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {respondentRole} • Protocol: {response.surveyTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Sentiment & Consensus
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                {response.sentimentLabel === 'Positive' ? (
                  <Smile className="w-4 h-4 text-emerald-500" />
                ) : response.sentimentLabel === 'Negative' ? (
                  <Frown className="w-4 h-4 text-rose-500" />
                ) : (
                  <Meh className="w-4 h-4 text-amber-500" />
                )}
                <span>{response.sentimentLabel || 'Positive'}</span>
                {response.sentimentScore !== undefined && (
                  <span className="text-slate-400 text-[11px] font-normal">
                    ({Math.round((response.sentimentScore + 1) * 50)}%)
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Audio Recording
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Mic className="w-4 h-4 text-indigo-500" />
                <span>
                  {response.audioDurationSeconds
                    ? `${Math.floor(response.audioDurationSeconds / 60)}m ${response.audioDurationSeconds % 60}s`
                    : '14m 20s'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Language Protocol
              </span>
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                {response.languageUsed || 'EN'} (Standard)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Timestamp
              </span>
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {new Date(response.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Interviewer Field Notes */}
          {response.interviewerNotes && (
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1.5">
                <Quote className="w-4 h-4" />
                <span>Interviewer Field Notes & Qualitative Insights</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed italic">
                "{response.interviewerNotes}"
              </p>
            </div>
          )}

          {/* AI-Extracted Requirements from this session */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Extracted Requirements & Specifications ({relatedRequirements.length})</span>
            </h4>
            <div className="space-y-2">
              {relatedRequirements.length > 0 ? (
                relatedRequirements.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                          {req.code}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {req.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {req.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {req.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No automated requirements linked directly to this specific session ID.
                </p>
              )}
            </div>
          </div>

          {/* Responses Breakdown */}
          {survey && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Question Responses & Likert Scores</span>
              </h4>
              <div className="space-y-3">
                {survey.questions.map((q, idx) => {
                  const ans = response.answers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          Q{idx + 1}. {q.title}
                        </span>
                        {ans?.likertValue !== undefined && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            Rating: {ans.likertValue} / 5
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{q.prompt}</p>

                      {ans?.textResponse && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-semibold text-slate-500 block mb-0.5">
                            Stakeholder Narrative:
                          </span>
                          {ans.textResponse}
                        </div>
                      )}

                      {ans?.probeResponses && ans.probeResponses.length > 0 && (
                        <div className="mt-2 pl-3 border-l-2 border-indigo-400 space-y-1.5">
                          {ans.probeResponses.map((p, pIdx) => (
                            <div key={pIdx} className="text-xs">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                Probe: {p.probe}
                              </span>
                              <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                                → {p.response}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Session ID: {response.id}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
