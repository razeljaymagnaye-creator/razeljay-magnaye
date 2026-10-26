/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Calendar,
  Clock,
  Download,
  Mail,
  CheckCircle2,
  Settings,
  Layers,
  Sparkles,
  Trash2,
  Play,
} from 'lucide-react';
import { Survey, SurveyResponse, ScheduledReport } from '../types/survey';
import {
  generateExcelCSV,
  generateWordDoc,
  getScheduledReports,
  saveScheduledReport,
  deleteScheduledReport,
  ReportTemplateType,
} from '../utils/exportUtils';

interface ReportsModalProps {
  survey: Survey;
  responses: SurveyResponse[];
  onTriggerPrint: (template: ReportTemplateType) => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  survey,
  responses,
  onTriggerPrint,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplateType>('summary');
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(getScheduledReports());

  // New Schedule Form
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleFreq, setScheduleFreq] = useState<'daily' | 'weekly' | 'monthly' | 'on-completion'>('weekly');
  const [scheduleRecipients, setScheduleRecipients] = useState('research-ethics@university.edu.ph, field-evaluator@gov.ph');
  const [scheduleFormat, setScheduleFormat] = useState<'pdf' | 'docx' | 'xlsx'>('pdf');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const matchingResponses = responses.filter(r => r.surveyId === survey.id);

  // 1-Click Excel CSV Export
  const handleExportExcel = () => {
    generateExcelCSV(survey, matchingResponses);
    showNotice('Excel Spreadsheet (.csv) generated and downloaded with full UTF-8 encoding.');
  };

  // 1-Click Word DOC Export
  const handleExportWord = () => {
    generateWordDoc({
      survey,
      responses: matchingResponses,
      template: selectedTemplate,
    });
    showNotice(`Microsoft Word (.doc) ${selectedTemplate.toUpperCase()} report generated and downloaded.`);
  };

  // 1-Click Printable / PDF Report
  const handleExportPDF = () => {
    onTriggerPrint(selectedTemplate);
  };

  const showNotice = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Save new scheduled report
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: ScheduledReport = {
      id: `sched_${Date.now()}`,
      surveyId: survey.id,
      title: `${survey.title} - Automated ${scheduleFreq.toUpperCase()} Dispatch`,
      frequency: scheduleFreq,
      template: selectedTemplate,
      recipients: scheduleRecipients.split(',').map(s => s.trim()).filter(Boolean),
      format: scheduleFormat,
      nextRunDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      active: true,
    };

    saveScheduledReport(newReport);
    setScheduledReports(getScheduledReports());
    setShowScheduleForm(false);
    showNotice(`Automated report schedule created for ${newReport.recipients.length} recipients.`);
  };

  // Delete schedule
  const handleDeleteSchedule = (id: string) => {
    deleteScheduledReport(id);
    setScheduledReports(getScheduledReports());
    showNotice('Scheduled report task removed.');
  };

  // Run on-demand test trigger
  const handleRunOnDemand = (item: ScheduledReport) => {
    if (item.format === 'xlsx') {
      handleExportExcel();
    } else if (item.format === 'docx') {
      handleExportWord();
    } else {
      handleExportPDF();
    }
    showNotice(`Simulated on-demand automated dispatch executed for ${item.recipients[0] || 'subscribers'}.`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Research Reporting & Multi-Format Export Engine</span>
          </h2>
          <p className="text-xs text-slate-500">
            One-click printable PDF, Word (.doc), and Excel (.csv) reports with automated scheduled triggers
          </p>
        </div>

        <div className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-mono text-slate-700 dark:text-slate-300">
          Target Dataset: <strong>{matchingResponses.length}</strong> Completed Submissions
        </div>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="font-bold underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Step 1: Select Report Template */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Step 1: Select Report Template Architecture</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Summary Template */}
          <div
            onClick={() => setSelectedTemplate('summary')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedTemplate === 'summary'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Executive Summary Report
              </span>
              {selectedTemplate === 'summary' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              High-level brief for leadership and sponsors. Includes response rates, mean scores, top favorable items, and executive synthesis.
            </p>
          </div>

          {/* Detailed Template */}
          <div
            onClick={() => setSelectedTemplate('detailed')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedTemplate === 'detailed'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Comprehensive Detailed Report
              </span>
              {selectedTemplate === 'detailed' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Complete academic psychometric breakdown. Item-by-item standard deviations, probe transcript records, and verbatim respondent quotes.
            </p>
          </div>

          {/* Comparative Template */}
          <div
            onClick={() => setSelectedTemplate('comparative')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedTemplate === 'comparative'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Comparative Group Analysis
              </span>
              {selectedTemplate === 'comparative' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Cross-tabulation comparing disparate demographic cohorts (e.g. Undergrad vs Graduate, or BHWs vs Residents) with delta calculations.
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: One-Click Export Formats */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Download className="w-4 h-4 text-emerald-500" />
          <span>Step 2: One-Click Instant File Export</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Action 1: Print / PDF */}
          <button
            onClick={handleExportPDF}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/20 hover:border-rose-400 dark:hover:border-rose-500 transition-all text-left space-y-2 cursor-pointer shadow-xs group"
          >
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              Print / Save as PDF
            </div>
            <p className="text-[11px] text-slate-500">
              Clean print-optimized layout with page headers, psychometric tables, divergence charts, and page breaks.
            </p>
          </button>

          {/* Action 2: Word (.doc) */}
          <button
            onClick={handleExportWord}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left space-y-2 cursor-pointer shadow-xs group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              Microsoft Word (.doc)
            </div>
            <p className="text-[11px] text-slate-500">
              Fully formatted Word document with editable styles, research metadata, statistical tables, and citations.
            </p>
          </button>

          {/* Action 3: Excel (.csv) */}
          <button
            onClick={handleExportExcel}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all text-left space-y-2 cursor-pointer shadow-xs group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              Excel Spreadsheet (.csv)
            </div>
            <p className="text-[11px] text-slate-500">
              Raw survey records, Likert numeric scores, UTF-8 BOM encoding for special characters, and timestamps.
            </p>
          </button>
        </div>
      </div>

      {/* Step 3: Scheduled Automated Report Dispatch (Requirement 6) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>Automated & Scheduled Report Generation</span>
            </h3>
            <p className="text-xs text-slate-500">
              Configure scheduled recurring dispatches (Daily, Weekly, or on completion of survey goals)
            </p>
          </div>

          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <span>{showScheduleForm ? 'Close Form' : '+ New Scheduled Task'}</span>
          </button>
        </div>

        {/* Schedule Form */}
        {showScheduleForm && (
          <form onSubmit={handleCreateSchedule} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Dispatch Frequency
                </label>
                <select
                  value={scheduleFreq}
                  onChange={(e) => setScheduleFreq(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 font-medium"
                >
                  <option value="daily">Daily Briefing (08:00 AM)</option>
                  <option value="weekly">Weekly Rollup (Every Monday)</option>
                  <option value="monthly">Monthly Executive Summary</option>
                  <option value="on-completion">Upon Every 20 Completed Surveys</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Delivery Format
                </label>
                <select
                  value={scheduleFormat}
                  onChange={(e) => setScheduleFormat(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 font-medium"
                >
                  <option value="pdf">Print-Ready PDF Document</option>
                  <option value="docx">Microsoft Word Report (.docx)</option>
                  <option value="xlsx">Excel Data Digest (.csv/.xlsx)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Recipients (Email addresses)
                </label>
                <input
                  type="text"
                  required
                  value={scheduleRecipients}
                  onChange={(e) => setScheduleRecipients(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-semibold shadow-xs"
              >
                Save Schedule Task
              </button>
            </div>
          </form>
        )}

        {/* Existing Schedules Table */}
        <div className="space-y-2">
          {scheduledReports.length > 0 ? (
            scheduledReports.map(item => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                    <span className="font-mono text-[10px] uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded">
                      {item.frequency}
                    </span>
                    <span className="font-mono text-[10px] uppercase bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {item.format}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] flex items-center gap-2">
                    <span>Recipients: {item.recipients.join(', ')}</span>
                    <span>• Next: {item.nextRunDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunOnDemand(item)}
                    className="text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded font-medium flex items-center gap-1 cursor-pointer"
                    title="Simulate on-demand immediate execution"
                  >
                    <Play className="w-3 h-3 text-emerald-500" />
                    <span>Run Now</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                    title="Remove Schedule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic py-2">
              No scheduled reports configured. Click "+ New Scheduled Task" above to automate research reporting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
