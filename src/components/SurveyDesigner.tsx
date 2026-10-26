/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Languages,
  Check,
  HelpCircle,
  FolderPlus,
  BookOpen,
  Sliders,
  AlertCircle,
  Tag,
  Gauge,
  ListPlus,
  MessageSquarePlus,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  Survey,
  SurveyQuestion,
  InterviewType,
  QuestionType,
  DifficultyLevel,
  LikertTemplateKey,
} from '../types/survey';
import { PREDEFINED_LIKERT_TEMPLATES, SEVEN_POINT_AGREEMENT } from '../utils/likertTemplates';
import { SUPPORTED_LANGUAGES, getLanguageName } from '../utils/languages';

interface SurveyDesignerProps {
  survey: Survey;
  onUpdateSurvey: (updated: Survey) => void;
  onOpenQuestionBank: () => void;
  currentLanguage: string;
}

export const SurveyDesigner: React.FC<SurveyDesignerProps> = ({
  survey,
  onUpdateSurvey,
  onOpenQuestionBank,
  currentLanguage,
}) => {
  // Editing state
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    survey.questions[0]?.id || null
  );

  // AI Generation Drawer State
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>(survey.title || 'Student Online Learning & Well-being');
  const [aiFocusArea, setAiFocusArea] = useState<string>('Pedagogical clarity and digital accessibility');
  const [aiInterviewType, setAiInterviewType] = useState<InterviewType>(survey.interviewType);
  const [aiTargetGroup, setAiTargetGroup] = useState<string>(survey.targetRespondentGroup);
  const [aiCount, setAiCount] = useState<number>(4);
  const [aiLang, setAiLang] = useState<string>('tl');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiGeneratedList, setAiGeneratedList] = useState<any[]>([]);

  // Translation in progress
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [scoringId, setScoringId] = useState<string | null>(null);
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});

  const toggleOptions = (qId: string) => {
    setExpandedOptions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const maxQuestions = 50;
  const currentCount = survey.questions.length;
  const isLimitReached = currentCount >= maxQuestions;

  // Add new blank question
  const handleAddQuestion = (type: QuestionType = 'likert') => {
    if (isLimitReached) return;

    const newQ: SurveyQuestion = {
      id: `q_${Date.now()}`,
      title: `Item ${currentCount + 1}: Research Query`,
      prompt: 'Enter clear, unbiased question prompt text here...',
      type,
      interviewType: survey.interviewType,
      category: 'General Assessment',
      difficulty: 'Beginner',
      relevanceScore: 92,
      tags: ['Assessment', 'Evaluation'],
      likertConfig: type === 'likert' ? PREDEFINED_LIKERT_TEMPLATES.agreement : undefined,
      probes: survey.interviewType === 'semi-structured' ? ['Can you describe a specific example?'] : undefined,
      translations: {},
    };

    const updated = {
      ...survey,
      questions: [...survey.questions, newQ],
      updatedAt: new Date().toISOString(),
    };
    onUpdateSurvey(updated);
    setActiveQuestionId(newQ.id);
  };

  // Duplicate question
  const handleDuplicate = (q: SurveyQuestion) => {
    if (isLimitReached) return;
    const duplicated: SurveyQuestion = {
      ...q,
      id: `q_${Date.now()}`,
      title: `${q.title} (Copy)`,
    };
    const idx = survey.questions.findIndex(x => x.id === q.id);
    const newQuestions = [...survey.questions];
    newQuestions.splice(idx + 1, 0, duplicated);

    onUpdateSurvey({
      ...survey,
      questions: newQuestions,
      updatedAt: new Date().toISOString(),
    });
    setActiveQuestionId(duplicated.id);
  };

  // Delete question
  const handleDelete = (id: string) => {
    if (survey.questions.length <= 1) {
      alert('Survey must retain at least one question item.');
      return;
    }
    const newQuestions = survey.questions.filter(q => q.id !== id);
    onUpdateSurvey({
      ...survey,
      questions: newQuestions,
      updatedAt: new Date().toISOString(),
    });
    if (activeQuestionId === id) {
      setActiveQuestionId(newQuestions[0]?.id || null);
    }
  };

  // Move up/down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= survey.questions.length) return;

    const newQuestions = [...survey.questions];
    const [moved] = newQuestions.splice(index, 1);
    newQuestions.splice(targetIndex, 0, moved);

    onUpdateSurvey({
      ...survey,
      questions: newQuestions,
      updatedAt: new Date().toISOString(),
    });
  };

  // Update specific question field
  const handleUpdateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
    const updatedQuestions = survey.questions.map(q => {
      if (q.id === id) {
        return { ...q, ...updates };
      }
      return q;
    });
    onUpdateSurvey({
      ...survey,
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    });
  };

  // Context-Aware Translation Call
  const handleTranslateQuestion = async (q: SurveyQuestion, targetLang: string) => {
    setTranslatingId(q.id);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: q.prompt,
          targetLanguage: targetLang,
          context: `${survey.interviewType} survey question for ${survey.targetRespondentGroup}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.translatedText) {
        handleUpdateQuestion(q.id, {
          translations: {
            ...q.translations,
            [targetLang]: data.translatedText,
          },
        });
      }
    } catch (e) {
      console.error('Translation error:', e);
    } finally {
      setTranslatingId(null);
    }
  };

  // Evaluate Question with AI (Difficulty and Relevance Scoring)
  const handleScoreQuestionWithAI = async (q: SurveyQuestion) => {
    setScoringId(q.id);
    try {
      const res = await fetch('/api/ai/score-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q.prompt,
          interviewType: survey.interviewType,
          targetGroup: survey.targetRespondentGroup,
        }),
      });
      const data = await res.json();
      if (data.success) {
        handleUpdateQuestion(q.id, {
          difficulty: data.difficulty || 'Intermediate',
          relevanceScore: data.relevanceScore || 94,
        });
      }
    } catch (err) {
      console.error('AI scoring error:', err);
    } finally {
      setScoringId(null);
    }
  };

  // Generate Questions with AI
  const handleGenerateAIQuestions = async () => {
    setIsGeneratingAi(true);
    setAiGeneratedList([]);
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          interviewType: aiInterviewType,
          targetGroup: aiTargetGroup,
          count: aiCount,
          language: aiLang,
          focusArea: aiFocusArea,
        }),
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setAiGeneratedList(data.questions);
      }
    } catch (err) {
      console.error('AI Question Gen failed:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Accept AI generated question into active survey
  const handleAdoptAiQuestion = (aiQ: any) => {
    if (isLimitReached) return;

    const newQuestion: SurveyQuestion = {
      id: `q_ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: aiQ.title || 'AI Suggested Item',
      prompt: aiQ.prompt || '',
      type: aiQ.type || 'likert',
      interviewType: aiInterviewType,
      category: aiQ.category || 'Evaluative',
      difficulty: aiQ.difficulty || 'Intermediate',
      relevanceScore: aiQ.relevanceScore || 95,
      tags: aiQ.tags || ['AI-Generated', 'Psychometric'],
      probes: aiQ.probes || (aiInterviewType === 'semi-structured' ? ['Can you expand on that?'] : undefined),
      likertConfig: aiQ.type === 'likert'
        ? (PREDEFINED_LIKERT_TEMPLATES[aiQ.likertTemplate as LikertTemplateKey] || PREDEFINED_LIKERT_TEMPLATES.agreement)
        : undefined,
      translations: aiQ.translation ? { [aiLang]: aiQ.translation } : {},
    };

    onUpdateSurvey({
      ...survey,
      questions: [...survey.questions, newQuestion],
      updatedAt: new Date().toISOString(),
    });
    setActiveQuestionId(newQuestion.id);

    // Remove adopted item from candidate list
    setAiGeneratedList(prev => prev.filter(item => item !== aiQ));
  };

  const handleAdoptAllAi = () => {
    const availableSlots = maxQuestions - survey.questions.length;
    const toAdd = aiGeneratedList.slice(0, availableSlots).map((aiQ, idx) => ({
      id: `q_ai_${Date.now()}_${idx}`,
      title: aiQ.title || `AI Item ${idx + 1}`,
      prompt: aiQ.prompt || '',
      type: (aiQ.type as QuestionType) || 'likert',
      interviewType: aiInterviewType,
      category: aiQ.category || 'Evaluative',
      difficulty: (aiQ.difficulty as DifficultyLevel) || 'Intermediate',
      relevanceScore: aiQ.relevanceScore || 94,
      tags: aiQ.tags || ['AI-Generated'],
      probes: aiQ.probes,
      likertConfig: aiQ.type === 'likert'
        ? (PREDEFINED_LIKERT_TEMPLATES[aiQ.likertTemplate as LikertTemplateKey] || PREDEFINED_LIKERT_TEMPLATES.agreement)
        : undefined,
      translations: aiQ.translation ? { [aiLang]: aiQ.translation } : {},
    }));

    onUpdateSurvey({
      ...survey,
      questions: [...survey.questions, ...toAdd],
      updatedAt: new Date().toISOString(),
    });
    setAiGeneratedList([]);
    setShowAiModal(false);
  };

  const activeQuestion = survey.questions.find(q => q.id === activeQuestionId) || survey.questions[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Survey Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="space-y-2">
          <input
            type="text"
            value={survey.title}
            onChange={(e) => onUpdateSurvey({ ...survey, title: e.target.value })}
            className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none w-full"
            placeholder="Survey Title"
          />
          <input
            type="text"
            value={survey.description}
            onChange={(e) => onUpdateSurvey({ ...survey, description: e.target.value })}
            className="text-xs text-slate-500 dark:text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none w-full"
            placeholder="Brief description or purpose of this survey..."
          />
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="font-medium">Target:</span>
            <input
              type="text"
              value={survey.targetRespondentGroup}
              onChange={(e) => onUpdateSurvey({ ...survey, targetRespondentGroup: e.target.value })}
              className="bg-slate-100 dark:bg-slate-800 rounded-md px-2.5 py-1 text-slate-800 dark:text-slate-200 font-medium border-0 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Students"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAiModal(true)}
              className="text-xs bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>AI Generate</span>
            </button>

            <button
              onClick={onOpenQuestionBank}
              className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Question Bank</span>
            </button>

            <button
              onClick={() => handleAddQuestion('likert')}
              disabled={isLimitReached}
              className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sequential Questions List */}
      <div className="space-y-4">
        {survey.questions.map((q, idx) => {
          const isExpanded = !!expandedOptions[q.id];
          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-all"
            >
              {/* Question Header & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <select
                    value={q.type}
                    onChange={(e) => {
                      const newType = e.target.value as QuestionType;
                      handleUpdateQuestion(q.id, {
                        type: newType,
                        likertConfig: newType === 'likert' ? PREDEFINED_LIKERT_TEMPLATES.agreement : undefined,
                      });
                    }}
                    className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-0 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 cursor-pointer focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="likert">Likert Scale (1 to 5)</option>
                    <option value="open-ended">Open-Ended (Text)</option>
                  </select>
                </div>

                {/* Move, Duplicate, Delete */}
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 cursor-pointer"
                    title="Move Question Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === survey.questions.length - 1}
                    className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 cursor-pointer"
                    title="Move Question Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    title="Duplicate Question"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Prompt Text Input */}
              <div>
                <textarea
                  rows={2}
                  value={q.prompt}
                  onChange={(e) => handleUpdateQuestion(q.id, { prompt: e.target.value })}
                  placeholder="Enter your question here..."
                  className="w-full text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Likert Scale Pill Preview */}
              {q.type === 'likert' && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400">Scale:</span>
                    {(q.likertConfig?.options || PREDEFINED_LIKERT_TEMPLATES.agreement.options).map((opt) => (
                      <span
                        key={opt.value}
                        className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 dark:text-slate-300"
                      >
                        {opt.value}. {opt.label}
                      </span>
                    ))}
                  </div>

                  <select
                    value={q.likertConfig?.template || 'agreement'}
                    onChange={(e) => {
                      const tmpl = e.target.value as LikertTemplateKey;
                      handleUpdateQuestion(q.id, {
                        likertConfig: PREDEFINED_LIKERT_TEMPLATES[tmpl] || PREDEFINED_LIKERT_TEMPLATES.agreement,
                      });
                    }}
                    className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded px-2 py-0.5 border-0 cursor-pointer"
                  >
                    <option value="agreement">Agreement (Agree/Disagree)</option>
                    <option value="satisfaction">Satisfaction (Satisfied/Dissatisfied)</option>
                    <option value="frequency">Frequency (Always/Never)</option>
                    <option value="importance">Importance (Important/Not Important)</option>
                  </select>
                </div>
              )}

              {/* Translation Display if exists */}
              {q.translations && Object.keys(q.translations).length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                  {Object.entries(q.translations).map(([langKey, transText]) => (
                    <div key={langKey} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300 italic">
                        <strong className="text-blue-600 uppercase font-mono mr-1">[{langKey}]:</strong> {transText}
                      </span>
                      <button
                        onClick={() => {
                          const updatedTranslations = { ...q.translations };
                          delete updatedTranslations[langKey];
                          handleUpdateQuestion(q.id, { translations: updatedTranslations });
                        }}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Collapsible "More options" (Translations, Probes, AI Score) */}
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => toggleOptions(q.id)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>{isExpanded ? 'Hide Extra Options' : 'More Options (Translation, Notes, AI Clarity)'}</span>
                </button>

                {isExpanded && (
                  <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3 text-xs border border-slate-200 dark:border-slate-700">
                    {/* Translate Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Languages className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Translate to Dialect:</span>
                        <select
                          id={`lang-sel-${q.id}`}
                          defaultValue="tl"
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1"
                        >
                          <option value="tl">Tagalog (Filipino)</option>
                          <option value="ceb">Cebuano (Bisaya)</option>
                          <option value="ilo">Ilocano</option>
                          <option value="hil">Hiligaynon</option>
                          <option value="bcl">Bikolano</option>
                          <option value="war">Waray-Waray</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          const sel = document.getElementById(`lang-sel-${q.id}`) as HTMLSelectElement;
                          handleTranslateQuestion(q, sel?.value || 'tl');
                        }}
                        disabled={translatingId === q.id}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {translatingId === q.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Translating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>Translate</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* AI Scoring */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">
                        Psychometric Relevance: <strong className="text-emerald-600">{q.relevanceScore}%</strong> • Level: <strong>{q.difficulty}</strong>
                      </span>
                      <button
                        onClick={() => handleScoreQuestionWithAI(q)}
                        disabled={scoringId === q.id}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{scoringId === q.id ? 'Scoring...' : 'Check with AI'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Question Big Bottom Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <span className="text-xs text-slate-400">
          Showing {currentCount} of {maxQuestions} maximum questions
        </span>
        <button
          onClick={() => handleAddQuestion('likert')}
          disabled={isLimitReached}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* AI QUESTION GENERATION MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    AI Question Generator (Multilingual Engine)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generates psychometrically tailored survey questions with Philippine dialect translations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Research Topic or Title
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Interview Type
                </label>
                <select
                  value={aiInterviewType}
                  onChange={(e) => setAiInterviewType(e.target.value as InterviewType)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                >
                  <option value="structured">Structured (Closed & Likert Items)</option>
                  <option value="semi-structured">Semi-Structured (Core + Probes)</option>
                  <option value="unstructured">Unstructured (In-Depth Narrative)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Target Language / Philippine Dialect
                </label>
                <select
                  value={aiLang}
                  onChange={(e) => setAiLang(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                >
                  <option value="tl">Tagalog (Filipino)</option>
                  <option value="ceb">Cebuano (Bisaya)</option>
                  <option value="ilo">Ilocano</option>
                  <option value="hil">Hiligaynon (Ilonggo)</option>
                  <option value="bcl">Bikolano</option>
                  <option value="war">Waray-Waray</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Target Demographic
                </label>
                <input
                  type="text"
                  value={aiTargetGroup}
                  onChange={(e) => setAiTargetGroup(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Questions to Generate
                </label>
                <select
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateAIQuestions}
              disabled={isGeneratingAi}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Tailored Psychometric Items...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Questions</span>
                </>
              )}
            </button>

            {/* Generated Results Preview */}
            {aiGeneratedList.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Generated Suggestions ({aiGeneratedList.length} items ready)
                  </span>
                  <button
                    onClick={handleAdoptAllAi}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-md font-semibold cursor-pointer"
                  >
                    Add All to Survey
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {aiGeneratedList.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-600 text-[10px] font-bold">
                            {item.relevanceScore}% Rel
                          </span>
                          <button
                            onClick={() => handleAdoptAiQuestion(item)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer"
                          >
                            + Add Item
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{item.prompt}</p>
                      {item.translation && (
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 italic">
                          [{aiLang.toUpperCase()}]: {item.translation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
