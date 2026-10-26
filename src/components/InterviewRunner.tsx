/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  Shuffle,
  Mic,
  MicOff,
  CheckCircle,
  Globe,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  Volume2,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Survey,
  SurveyResponse,
  InterviewMode,
  RespondentProfile,
  AnswerRecord,
} from '../types/survey';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { offlineSyncManager } from '../utils/offlineSync';

interface InterviewRunnerProps {
  survey: Survey;
  onRecordCompleted: (newResponse: SurveyResponse) => void;
  defaultLanguage: string;
}

export const InterviewRunner: React.FC<InterviewRunnerProps> = ({
  survey,
  onRecordCompleted,
  defaultLanguage,
}) => {
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('individual');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [sessionLanguage, setSessionLanguage] = useState<string>(defaultLanguage || 'en');
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});

  // Group participants (for group mode)
  const [groupParticipants, setGroupParticipants] = useState<string[]>(['Participant 1', 'Participant 2']);

  // Audio recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);

  // Optional interviewer notes toggle
  const [showNotes, setShowNotes] = useState(false);

  // Submitting status
  const [isDone, setIsDone] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);

  // Active question set
  const questions = survey.questions;
  const currentQ = questions[currentIndex] || questions[0];
  const currentAns = answers[currentQ?.id] || { questionId: currentQ?.id };

  // Audio timer
  useEffect(() => {
    let t: any = null;
    if (isRecording) {
      t = setInterval(() => setRecordSec(s => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  const setAnswerValue = (val: number) => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        likertValue: val,
      },
    }));
  };

  const setTextAnswer = (text: string) => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        textResponse: text,
      },
    }));
  };

  const handleSubmit = async () => {
    const responseRecord: SurveyResponse = {
      id: `resp_${Date.now()}`,
      surveyId: survey.id,
      surveyTitle: survey.title,
      interviewType: survey.interviewType,
      interviewMode: interviewMode,
      respondentGroup: survey.targetRespondentGroup,
      respondents: interviewMode === 'group'
        ? groupParticipants.map((p, i) => ({ id: `p_${i}`, nameOrCode: p, group: survey.targetRespondentGroup }))
        : [{ id: `r_1`, nameOrCode: 'Respondent', group: survey.targetRespondentGroup }],
      answers,
      languageUsed: sessionLanguage,
      audioRecorded: recordSec > 0,
      audioDurationSeconds: recordSec,
      timestamp: new Date().toISOString(),
      syncStatus: 'synced',
      sentimentScore: 0.65,
      sentimentLabel: 'Positive',
      keywords: ['Positive', 'Supportive', 'Clear'],
    };

    const result = await offlineSyncManager.saveSurveyResponse(responseRecord);
    onRecordCompleted(responseRecord);

    setIsDone(true);
    setSubmittedFeedback(
      result.isOffline
        ? 'Survey saved safely offline! It will automatically sync when you reconnect.'
        : 'Thank you! Survey successfully recorded and synced.'
    );
  };

  const resetSurvey = () => {
    setAnswers({});
    setCurrentIndex(0);
    setIsDone(false);
    setSubmittedFeedback(null);
    setIsRecording(false);
    setRecordSec(0);
  };

  if (isDone) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Survey Completed!</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{submittedFeedback}</p>
        </div>
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={resetSurvey}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm shadow-sm transition-all cursor-pointer"
          >
            Start Another Survey
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="text-center py-16 text-slate-500">
        No questions found in this survey. Please add questions in the "Edit & Questions" tab.
      </div>
    );
  }

  // Question translation for selected language
  const translationText = sessionLanguage !== 'en' && currentQ.translations?.[sessionLanguage];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Top Simple Bar: Progress and Language */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <div className="font-semibold text-slate-700 dark:text-slate-300">
          Question {currentIndex + 1} of {questions.length} ({progressPercent}%)
        </div>

        <div className="flex items-center gap-2">
          {/* Subtle Language switch */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1">
            <Globe className="w-3 h-3 text-slate-400" />
            <select
              value={sessionLanguage}
              onChange={(e) => setSessionLanguage(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Audio toggle */}
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isRecording
                ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800'
            }`}
            title={isRecording ? `Recording (${recordSec}s)` : 'Record audio note'}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Question Header & Title */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {currentQ.category || 'Survey Item'}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
            {translationText || currentQ.prompt}
          </h2>
          {translationText && (
            <p className="text-xs text-slate-400 italic">
              English: {currentQ.prompt}
            </p>
          )}
        </div>

        {/* Likert Scale 5-Point Rating Buttons (Simple & Big) */}
        {currentQ.type === 'likert' && (
          <div className="space-y-3 pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Select Your Answer:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {(currentQ.likertConfig?.options || [
                { value: 1, label: 'Strongly Disagree' },
                { value: 2, label: 'Disagree' },
                { value: 3, label: 'Neutral' },
                { value: 4, label: 'Agree' },
                { value: 5, label: 'Strongly Agree' },
              ]).map(opt => {
                const isSelected = currentAns.likertValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswerValue(opt.value)}
                    className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/40 scale-[1.02]'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className={`text-lg font-bold font-mono ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                      {opt.value}
                    </span>
                    <span className="text-xs font-medium leading-tight">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Open-Ended Question Text Area */}
        {currentQ.type === 'open-ended' && (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Type Your Answer:
            </label>
            <textarea
              rows={5}
              value={currentAns.textResponse || ''}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Share your thoughts, experiences, or feedback..."
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Optional Probes (Semi-Structured) */}
        {currentQ.probes && currentQ.probes.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Follow-Up Question Cues:</span>
            </span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              {currentQ.probes.map((pr, i) => (
                <li key={i}>{pr}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes Toggle for Interviewer */}
        <div className="pt-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showNotes ? 'Hide Field Notes' : '+ Add Field Observation Note'}</span>
          </button>
          {showNotes && (
            <textarea
              rows={2}
              value={currentAns.interviewerNotes || ''}
              onChange={(e) => {
                setAnswers(prev => ({
                  ...prev,
                  [currentQ.id]: {
                    ...prev[currentQ.id],
                    questionId: currentQ.id,
                    interviewerNotes: e.target.value,
                  },
                }));
              }}
              placeholder="Notes on participant response, non-verbal cues..."
              className="w-full mt-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
            />
          )}
        </div>
      </div>

      {/* Clean Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Submit Survey</span>
          </button>
        )}
      </div>
    </div>
  );
};
