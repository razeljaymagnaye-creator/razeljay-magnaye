/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Tag,
  Star,
  Layers,
  Sparkles,
} from 'lucide-react';
import { RequirementItem, RequirementCategory, RequirementPriority, RequirementStatus, Survey } from '../types/survey';

interface RequirementsMatrixViewProps {
  requirements: RequirementItem[];
  onUpdateRequirements: (reqs: RequirementItem[]) => void;
  activeSurvey: Survey;
}

export const RequirementsMatrixView: React.FC<RequirementsMatrixViewProps> = ({
  requirements,
  onUpdateRequirements,
  activeSurvey,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New requirement form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<RequirementCategory>('functional');
  const [newPriority, setNewPriority] = useState<RequirementPriority>('high');
  const [newTags, setNewTags] = useState('');

  const filtered = requirements.filter(req => {
    if (activeCategory !== 'all' && req.category !== activeCategory) return false;
    if (selectedPriority !== 'all' && req.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        req.title.toLowerCase().includes(q) ||
        req.code.toLowerCase().includes(q) ||
        req.description.toLowerCase().includes(q) ||
        req.tags.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateStatus = (id: string, newStatus: RequirementStatus) => {
    const updated = requirements.map(r => r.id === id ? { ...r, status: newStatus } : r);
    onUpdateRequirements(updated);
  };

  const handleCreateRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const prefix = newCategory === 'functional' ? 'FR' : newCategory === 'non-functional' ? 'NFR' : newCategory === 'pain-point' ? 'PP' : 'US';
    const num = Math.floor(100 + Math.random() * 900);

    const created: RequirementItem = {
      id: `req_${Date.now()}`,
      code: `${prefix}-${num}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom requirement specification recorded by researcher.',
      category: newCategory,
      priority: newPriority,
      status: 'identified',
      surveyId: activeSurvey.id,
      stakeholderName: 'Research Guild',
      consensusScore: 90,
      likertScore: 4.5,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      acceptanceCriteria: ['Pass automated verification test', 'Sign-off by product lead'],
      createdAt: new Date().toISOString(),
    };

    onUpdateRequirements([created, ...requirements]);
    setNewTitle('');
    setNewDesc('');
    setNewTags('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Project Specification
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">{activeSurvey.title}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Requirements Traceability Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cataloged specifications, functional requirements, non-functional criteria, and stakeholder consensus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Requirement</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All ({requirements.length})
          </button>
          <button
            onClick={() => setActiveCategory('functional')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeCategory === 'functional'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Functional (FR)
          </button>
          <button
            onClick={() => setActiveCategory('non-functional')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeCategory === 'non-functional'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Non-Functional (NFR)
          </button>
          <button
            onClick={() => setActiveCategory('pain-point')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeCategory === 'pain-point'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Pain Points (PP)
          </button>
        </div>

        {/* Search & Priority Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specifications..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Requirements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((req) => (
          <div
            key={req.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800/60 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {req.code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(req.code)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
                    title="Copy code"
                  >
                    {copiedId === req.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    req.priority === 'critical'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                      : req.priority === 'high'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                  }`}>
                    {req.priority}
                  </span>
                </div>

                {/* Status Dropdown */}
                <select
                  value={req.status}
                  onChange={(e) => handleUpdateStatus(req.id, e.target.value as RequirementStatus)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="identified">Identified</option>
                  <option value="in-review">In Review</option>
                  <option value="validated">Validated</option>
                  <option value="deferred">Deferred</option>
                </select>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {req.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {req.description}
                </p>
              </div>

              {/* Acceptance Criteria */}
              {req.acceptanceCriteria && req.acceptanceCriteria.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Acceptance Criteria:
                  </span>
                  {req.acceptanceCriteria.map((ac, acIdx) => (
                    <div key={acIdx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{ac}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Stakeholder: {req.stakeholderName || 'Cross-Session'}</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {req.consensusScore || 90}% Consensus
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Requirement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add New Requirement Specification
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Requirement Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Offline LMS Local Caching & Recovery"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Specification Description & Rationale
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the functional behavior, stakeholder needs, and acceptance criteria..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as RequirementCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  >
                    <option value="functional">Functional (FR)</option>
                    <option value="non-functional">Non-Functional (NFR)</option>
                    <option value="pain-point">Pain Point (PP)</option>
                    <option value="user-story">User Story (US)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as RequirementPriority)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  >
                    <option value="critical">Critical (P1)</option>
                    <option value="high">High (P2)</option>
                    <option value="medium">Medium (P3)</option>
                    <option value="low">Low (P4)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Offline, LMS, Resilience, UX"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-xs cursor-pointer"
                >
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
