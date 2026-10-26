/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Plus,
  Tag,
  Gauge,
  CheckCircle,
  Copy,
  BookOpen,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { SurveyQuestion, Survey, InterviewType, DifficultyLevel } from '../types/survey';
import { PREDEFINED_LIKERT_TEMPLATES } from '../utils/likertTemplates';

interface QuestionBankViewProps {
  questionBank: SurveyQuestion[];
  activeSurvey: Survey;
  onAddQuestionToSurvey: (question: SurveyQuestion) => void;
  onSaveNewBankQuestion: (question: SurveyQuestion) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questionBank,
  activeSurvey,
  onAddQuestionToSurvey,
  onSaveNewBankQuestion,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedInterviewType, setSelectedInterviewType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New question form state
  const [newTitle, setNewTitle] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newCategory, setNewCategory] = useState('Psychometric Assessment');
  const [newType, setNewType] = useState<InterviewType>('structured');
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [newTags, setNewTags] = useState('Standard, Psychometrics');

  // Categories list
  const categories = Array.from(new Set(questionBank.map(q => q.category)));

  // Filtered list
  const filtered = questionBank.filter(q => {
    if (searchTerm) {
      const match = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }
    if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
    if (selectedInterviewType !== 'all' && q.interviewType !== selectedInterviewType) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    const created: SurveyQuestion = {
      id: `qb_${Date.now()}`,
      title: newTitle || 'Custom Bank Question',
      prompt: newPrompt,
      type: newType === 'unstructured' ? 'open-ended' : 'likert',
      interviewType: newType,
      category: newCategory,
      difficulty: newDifficulty,
      relevanceScore: 95,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      likertConfig: newType !== 'unstructured' ? PREDEFINED_LIKERT_TEMPLATES.agreement : undefined,
      translations: {},
    };

    onSaveNewBankQuestion(created);
    setShowCreateModal(false);
    setNewTitle('');
    setNewPrompt('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Standardized Psychometric Question Bank</span>
          </h2>
          <p className="text-xs text-slate-500">
            Pre-validated research constructs, Likert templates, and narrative inquiries with 1-click active survey import
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Bank Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords, construct titles, prompts..."
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedInterviewType}
          onChange={(e) => setSelectedInterviewType(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium"
        >
          <option value="all">All Interview Types</option>
          <option value="structured">Structured</option>
          <option value="semi-structured">Semi-Structured</option>
          <option value="unstructured">Unstructured</option>
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium"
        >
          <option value="all">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(q => {
          const isAlreadyInSurvey = activeSurvey.questions.some(item => item.prompt === q.prompt);

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded text-[10px]">
                    {q.category}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                    {q.interviewType}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {q.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {q.prompt}
                </p>

                {/* Tags & Probes snippet */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {q.tags.map(t => (
                    <span key={t} className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>{q.difficulty} • {q.relevanceScore}% Rel</span>
                </span>

                <button
                  onClick={() => onAddQuestionToSurvey(q)}
                  disabled={isAlreadyInSurvey}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isAlreadyInSurvey
                      ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                  }`}
                >
                  {isAlreadyInSurvey ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Survey</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Question Bank Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Question to Permanent Repository
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Question Title / Concept
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Cognitive Fatigue & Synchronous Screen Time"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Full Question Prompt Text
                </label>
                <textarea
                  required
                  rows={3}
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Enter standardized wording..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Construct Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Interview Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as InterviewType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  >
                    <option value="structured">Structured</option>
                    <option value="semi-structured">Semi-Structured</option>
                    <option value="unstructured">Unstructured</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Cognitive Difficulty
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-xs"
                >
                  Save to Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
