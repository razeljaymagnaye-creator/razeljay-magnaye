/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, DashboardViewType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { RequirementsMatrixView } from './components/RequirementsMatrixView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SurveyDesigner } from './components/SurveyDesigner';
import { InterviewRunner } from './components/InterviewRunner';
import { QuestionBankView } from './components/QuestionBankView';
import { SettingsView } from './components/SettingsView';
import { SyncModal } from './components/SyncModal';
import { PrintReportView } from './components/PrintReportView';
import { ChatBot } from './components/ChatBot';
import { LoginModal } from './components/LoginModal';
import { deriveRequirementsFromResponses } from './data/requirementsData';
import { Survey, SurveyQuestion, SurveyResponse, AppUser, RequirementItem } from './types/survey';
import { offlineSyncManager, SyncStatusState } from './utils/offlineSync';
import { authManager } from './utils/auth';
import { ReportTemplateType } from './utils/exportUtils';
import { PREDEFINED_LIKERT_TEMPLATES } from './utils/likertTemplates';

// Clear legacy demo and saved survey data once on each browser after deployment.
// Authentication records and application configuration are intentionally preserved.
offlineSyncManager.clearSurveyDataOnce();

export default function App() {
  // Authentication & Current User State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => authManager.getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = authManager.subscribe(user => setCurrentUser(user));
    return () => unsub();
  }, []);

  // Offline Sync State
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>(offlineSyncManager.getStatus());
  useEffect(() => {
    const unsub = offlineSyncManager.subscribe(status => setSyncStatus(status));
    return () => unsub();
  }, []);

  // Active View State: default to 'dashboard' (Bolt Dashboard design)
  const [currentView, setCurrentView] = useState<DashboardViewType>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Surveys State
  const [surveys, setSurveys] = useState<Survey[]>(() => offlineSyncManager.getCachedSurveys());

  const [activeSurveyId, setActiveSurveyId] = useState<string>(surveys[0]?.id || 'survey-structured-01');

  // Question Bank State & Modal
  const [questionBank, setQuestionBank] = useState<SurveyQuestion[]>([]);
  const [showQuestionBankModal, setShowQuestionBankModal] = useState<boolean>(false);

  // Survey Responses State
  const [responses, setResponses] = useState<SurveyResponse[]>(() => offlineSyncManager.getAllStoredResponses());

  // Requirements State (Synthesized from interviews & surveys)
  const [requirements, setRequirements] = useState<RequirementItem[]>(() => {
    return deriveRequirementsFromResponses(responses, surveys);
  });

  // Multilingual State (Tagalog & Philippine Dialects)
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  // Modals & Print States
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState<boolean>(false);
  const [printTemplate, setPrintTemplate] = useState<ReportTemplateType>('summary');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // New Survey Modal
  const [showNewSurveyModal, setShowNewSurveyModal] = useState<boolean>(false);
  const [newSurveyTitle, setNewSurveyTitle] = useState('');
  const [newSurveyType, setNewSurveyType] = useState<'structured' | 'semi-structured' | 'unstructured'>('semi-structured');
  const [newSurveyTarget, setNewSurveyTarget] = useState('Undergraduate & Graduate Students');

  // Cache surveys whenever updated
  useEffect(() => {
    offlineSyncManager.cacheSurveys(surveys);
  }, [surveys]);

  const activeSurvey = surveys.find(s => s.id === activeSurveyId) || surveys[0];

  // Update active survey
  const handleUpdateSurvey = (updated: Survey) => {
    setSurveys(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  // Record a completed response (from InterviewRunner)
  const handleRecordResponse = (newResponse: SurveyResponse) => {
    setResponses(prev => [newResponse, ...prev]);

    // Automatically derive requirement if notes were added
    if (newResponse.interviewerNotes && newResponse.interviewerNotes.length > 15) {
      const newReq: RequirementItem = {
        id: `req-new-${Date.now()}`,
        code: `FR-${Math.floor(200 + Math.random() * 800)}`,
        title: `Requirement: ${newResponse.respondentGroup}`,
        description: newResponse.interviewerNotes,
        category: newResponse.sentimentLabel === 'Negative' ? 'pain-point' : 'functional',
        priority: newResponse.sentimentLabel === 'Negative' ? 'critical' : 'high',
        status: 'identified',
        surveyId: newResponse.surveyId,
        sourceInterviewId: newResponse.id,
        stakeholderName: newResponse.respondents[0]?.nameOrCode || 'Stakeholder',
        consensusScore: 92,
        likertScore: 4.6,
        tags: ['Interview Finding', newResponse.interviewType],
        acceptanceCriteria: ['Review with engineering team', 'Schedule prototype probe'],
        createdAt: new Date().toISOString(),
      };
      setRequirements(prev => [newReq, ...prev]);
    }

    // Switch back to dashboard to see results
    setCurrentView('dashboard');
  };

  // Add question from Question Bank to active survey
  const handleAddQuestionFromBank = (qbItem: SurveyQuestion) => {
    if (activeSurvey.questions.length >= 50) {
      alert('Survey reached maximum limit of 50 questions.');
      return;
    }
    const cloned: SurveyQuestion = {
      ...qbItem,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    handleUpdateSurvey({
      ...activeSurvey,
      questions: [...activeSurvey.questions, cloned],
      updatedAt: new Date().toISOString(),
    });
    alert(`Added "${qbItem.title}" to active survey "${activeSurvey.title}".`);
  };

  // Add new question to permanent bank
  const handleSaveNewBankQuestion = (newQ: SurveyQuestion) => {
    setQuestionBank(prev => [newQ, ...prev]);
  };

  // Create new survey
  const handleCreateNewSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurveyTitle.trim()) return;

    const created: Survey = {
      id: `survey-${Date.now()}`,
      title: newSurveyTitle,
      description: 'Standardized research inquiry instrument created with AI Requirements Studio.',
      targetRespondentGroup: newSurveyTarget,
      interviewType: newSurveyType,
      defaultLanguage: currentLanguage,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: `q_${Date.now()}_1`,
          title: 'Primary Assessment Item',
          prompt: 'To what extent do you agree that services and resources provided are adequate?',
          type: newSurveyType === 'unstructured' ? 'open-ended' : 'likert',
          interviewType: newSurveyType,
          category: 'Core Assessment',
          difficulty: 'Beginner',
          relevanceScore: 96,
          tags: ['Core', 'Evaluation'],
          likertConfig: newSurveyType !== 'unstructured' ? PREDEFINED_LIKERT_TEMPLATES.agreement : undefined,
          probes: newSurveyType === 'semi-structured' ? ['Can you give a concrete example?'] : undefined,
          translations: {},
        },
      ],
    };

    setSurveys(prev => [created, ...prev]);
    setActiveSurveyId(created.id);
    setShowNewSurveyModal(false);
    setNewSurveyTitle('');
    setCurrentView('surveys');
  };

  // If in Print View
  if (isPrintViewOpen) {
    return (
      <PrintReportView
        survey={activeSurvey}
        responses={responses}
        template={printTemplate}
        onClose={() => setIsPrintViewOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Offline Alert Strip when actually offline */}
      {(!syncStatus.isOnline || syncStatus.isSimulatedOffline) && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between sticky top-0 z-50">
          <span>Offline Mode Active — Local IndexedDB cache active. All interview records are saved locally.</span>
          <button
            onClick={() => offlineSyncManager.toggleSimulatedOffline()}
            className="underline hover:text-amber-100 cursor-pointer"
          >
            {syncStatus.isSimulatedOffline ? 'Go Online' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Modern Left Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        surveys={surveys}
        activeSurveyId={activeSurveyId}
        onSelectSurvey={setActiveSurveyId}
        syncStatus={syncStatus}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onToggleCopilot={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (Offset by Sidebar on Desktop) */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <Header
          currentView={currentView}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onStartNewInterview={() => setCurrentView('interviews')}
          onNewSurvey={() => setShowNewSurveyModal(true)}
          currentLanguage={currentLanguage}
          setCurrentLanguage={setCurrentLanguage}
          syncStatus={syncStatus}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onToggleCopilot={() => setIsChatOpen(!isChatOpen)}
          isChatOpen={isChatOpen}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {!activeSurvey ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">No survey data</h2>
              <p className="max-w-md text-sm text-slate-500">Existing surveys, questions, responses, and analysis records have been cleared. Create a new survey to begin collecting fresh data.</p>
              <button
                onClick={() => setShowNewSurveyModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 cursor-pointer"
              >
                Create New Survey
              </button>
            </div>
          ) : (
          <>
          {/* View 1: Bolt-Style Dashboard Overview */}
          {currentView === 'dashboard' && (
            <DashboardOverview
              surveys={surveys}
              responses={responses}
              requirements={requirements}
              activeSurveyId={activeSurveyId}
              onSelectSurvey={setActiveSurveyId}
              onNavigateToRunner={() => setCurrentView('interviews')}
              onNavigateToDesigner={() => setCurrentView('surveys')}
              onNavigateToMatrix={() => setCurrentView('requirements')}
              onNavigateToAnalytics={() => setCurrentView('analytics')}
              onTriggerPrint={(template) => {
                setPrintTemplate(template);
                setIsPrintViewOpen(true);
              }}
              onToggleCopilot={() => setIsChatOpen(true)}
              searchFilter={searchQuery}
            />
          )}

          {/* View 2: Live Interview Runner */}
          {currentView === 'interviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Live Stakeholder Interview Runner
                  </h2>
                  <p className="text-xs text-slate-500">
                    Conducting: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeSurvey.title}</span> ({activeSurvey.interviewType})
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
              <InterviewRunner
                survey={activeSurvey}
                onRecordCompleted={handleRecordResponse}
                defaultLanguage={currentLanguage}
              />
            </div>
          )}

          {/* View 3: Requirements Matrix */}
          {currentView === 'requirements' && (
            <RequirementsMatrixView
              requirements={requirements}
              onUpdateRequirements={setRequirements}
              activeSurvey={activeSurvey}
            />
          )}

          {/* View 4: Survey / Instrument Builder */}
          {currentView === 'surveys' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Survey & Psychometrics Instrument Designer
                  </h2>
                  <p className="text-xs text-slate-500">
                    Editing protocol: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeSurvey.title}</span>
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
              <SurveyDesigner
                survey={activeSurvey}
                onUpdateSurvey={handleUpdateSurvey}
                onOpenQuestionBank={() => setShowQuestionBankModal(true)}
                currentLanguage={currentLanguage}
              />
            </div>
          )}

          {/* View 5: Detailed Psychometrics & Export Reports */}
          {currentView === 'analytics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Analytics, Likert Breakdown & Multi-Format Reports
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comprehensive reporting for: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeSurvey.title}</span>
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
              <AnalyticsDashboard
                surveys={surveys}
                responses={responses}
                activeSurveyId={activeSurveyId}
                setActiveSurveyId={setActiveSurveyId}
                onNavigateToInterview={() => setCurrentView('interviews')}
                onTriggerPrint={(template) => {
                  setPrintTemplate(template);
                  setIsPrintViewOpen(true);
                }}
              />
            </div>
          )}

          {/* View 6: Settings & Encryption Storage */}
          {currentView === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              syncStatus={syncStatus}
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
            />
          )}
          </>
          )}
        </main>
      </div>

      {/* Question Bank Modal */}
      {showQuestionBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pick from Psychometrics & Question Bank
              </h3>
              <button
                onClick={() => setShowQuestionBankModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <QuestionBankView
              questionBank={questionBank}
              activeSurvey={activeSurvey}
              onAddQuestionToSurvey={(q) => {
                handleAddQuestionFromBank(q);
                setShowQuestionBankModal(false);
              }}
              onSaveNewBankQuestion={handleSaveNewBankQuestion}
            />
          </div>
        </div>
      )}

      {/* Offline Sync & Security Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      {/* New Survey Instrument Modal */}
      {showNewSurveyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Research Survey Instrument
              </h3>
              <button
                onClick={() => setShowNewSurveyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewSurvey} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Survey Title / Instrument Name
                </label>
                <input
                  type="text"
                  required
                  value={newSurveyTitle}
                  onChange={(e) => setNewSurveyTitle(e.target.value)}
                  placeholder="e.g. Stakeholder E-Commerce Architecture Requirements"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Interview Protocol Type
                </label>
                <select
                  value={newSurveyType}
                  onChange={(e) => setNewSurveyType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                >
                  <option value="structured">Structured Interview (Standardized & Closed Items)</option>
                  <option value="semi-structured">Semi-Structured (Core Questions + Follow-up Probes)</option>
                  <option value="unstructured">Unstructured (In-Depth Narrative Inquiries)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Target Respondent Group
                </label>
                <input
                  type="text"
                  value={newSurveyTarget}
                  onChange={(e) => setNewSurveyTarget(e.target.value)}
                  placeholder="e.g. Lead Architects & Product Managers"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewSurveyModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-xs cursor-pointer"
                >
                  Create Instrument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Survey Research Copilot Chatbot */}
      <ChatBot
        activeSurvey={activeSurvey}
        responses={responses}
        onAddQuestionToSurvey={handleAddQuestionFromBank}
        currentLanguage={currentLanguage}
        isOpen={isChatOpen}
        onToggleOpen={setIsChatOpen}
      />

      {/* Offline User Authentication & Profile Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
