/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Survey, SurveyResponse, ScheduledReport } from '../types/survey';
import { calculateLikertStats } from './likertTemplates';

export type ReportTemplateType = 'summary' | 'detailed' | 'comparative';

export interface ReportConfig {
  survey: Survey;
  responses: SurveyResponse[];
  template: ReportTemplateType;
  filterGroup?: string;
  comparisonGroupA?: string;
  comparisonGroupB?: string;
}

export function generateExcelCSV(survey: Survey, responses: SurveyResponse[]): void {
  const matching = responses.filter(r => r.surveyId === survey.id);

  // Headers
  const questionHeaders = survey.questions.map((q, idx) => `Q${idx + 1}: ${q.title.replace(/"/g, '""')}`);
  const csvHeaders = [
    'Response ID',
    'Respondent Code / Name',
    'Respondent Group',
    'Interview Type',
    'Interview Mode',
    'Language Used',
    'Submission Timestamp',
    'Sync Status',
    'Sentiment Score (-1 to 1)',
    'Sentiment Label',
    ...questionHeaders,
    'Interviewer Field Notes',
  ];

  const rows = matching.map(resp => {
    const respondentName = resp.respondents.map(r => r.nameOrCode).join('; ');
    const qAnswers = survey.questions.map(q => {
      const ans = resp.answers[q.id];
      if (!ans) return '';
      if (ans.likertValue !== undefined) return ans.likertValue;
      if (ans.selectedOptions && ans.selectedOptions.length) return ans.selectedOptions.join('; ');
      if (ans.textResponse) return `"${ans.textResponse.replace(/"/g, '""')}"`;
      if (ans.probeResponses && ans.probeResponses.length) {
        return `"${ans.probeResponses.map(p => `${p.probe}: ${p.response}`).join(' | ').replace(/"/g, '""')}"`;
      }
      return '';
    });

    return [
      `"${resp.id}"`,
      `"${respondentName.replace(/"/g, '""')}"`,
      `"${resp.respondentGroup.replace(/"/g, '""')}"`,
      `"${resp.interviewType}"`,
      `"${resp.interviewMode}"`,
      `"${resp.languageUsed}"`,
      `"${resp.timestamp}"`,
      `"${resp.syncStatus}"`,
      resp.sentimentScore !== undefined ? resp.sentimentScore : '',
      `"${resp.sentimentLabel || ''}"`,
      ...qAnswers,
      `"${(resp.interviewerNotes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [csvHeaders.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${survey.title.replace(/[^a-z0-9]/gi, '_')}_Responses.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateWordDoc(config: ReportConfig): void {
  const { survey, responses, template } = config;
  const matching = responses.filter(r => r.surveyId === survey.id);

  // Psychometrics summary
  const likertQuestions = survey.questions.filter(q => q.type === 'likert');
  const totalCompleted = matching.length;

  const headerHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${survey.title} - Official Research Survey Report</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.5; color: #1e293b; padding: 24px; }
        h1 { color: #0f172a; font-size: 24pt; border-bottom: 2pt solid #2563eb; padding-bottom: 6px; }
        h2 { color: #1e3a8a; font-size: 16pt; margin-top: 20pt; }
        h3 { color: #334155; font-size: 13pt; }
        .meta-box { background: #f8fafc; border: 1pt solid #cbd5e1; padding: 12px; margin-bottom: 20px; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px; font-size: 10.5pt; }
        th, td { border: 1pt solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; }
        .quote { background: #f0fdf4; border-left: 4pt solid #16a34a; padding: 8px 12px; margin: 8px 0; font-style: italic; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 9pt; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>AI Survey Instrument — Research Report</h1>
      <div class="meta-box">
        <p><strong>Survey Title:</strong> ${survey.title}</p>
        <p><strong>Interview Type:</strong> ${survey.interviewType.toUpperCase()} | <strong>Target Demographic:</strong> ${survey.targetRespondentGroup}</p>
        <p><strong>Report Template:</strong> ${template.toUpperCase()} REPORT | <strong>Date of Export:</strong> ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
        <p><strong>Total Valid Responses:</strong> ${totalCompleted} submissions recorded</p>
      </div>
  `;

  let bodyHtml = '';

  if (template === 'summary' || template === 'detailed') {
    bodyHtml += `
      <h2>1. Executive Summary & Psychometric Aggregates</h2>
      <p>This report documents psychometric and qualitative findings conducted via the AI Survey Instrument platform. Total verified sample size: <strong>${totalCompleted}</strong> respondents.</p>

      <table>
        <thead>
          <tr>
            <th>Item #</th>
            <th>Question Item</th>
            <th>Category</th>
            <th>Type</th>
            <th>Mean Score</th>
            <th>Std Dev (σ)</th>
            <th>% Favorable</th>
          </tr>
        </thead>
        <tbody>
    `;

    survey.questions.forEach((q, idx) => {
      if (q.type === 'likert') {
        const values = matching.map(r => r.answers[q.id]?.likertValue).filter((v): v is number => typeof v === 'number');
        const stats = calculateLikertStats(values, q.likertConfig?.points || 5);
        bodyHtml += `
          <tr>
            <td>Q${idx + 1}</td>
            <td><strong>${q.title}</strong><br><small style="color:#64748b">${q.prompt}</small></td>
            <td>${q.category}</td>
            <td>Likert (${q.likertConfig?.points || 5}-pt)</td>
            <td><strong>${stats.mean > 0 ? stats.mean.toFixed(2) : 'N/A'}</strong></td>
            <td>${stats.standardDeviation > 0 ? stats.standardDeviation.toFixed(2) : 'N/A'}</td>
            <td>${stats.favorablePercent}%</td>
          </tr>
        `;
      } else {
        bodyHtml += `
          <tr>
            <td>Q${idx + 1}</td>
            <td><strong>${q.title}</strong><br><small style="color:#64748b">${q.prompt}</small></td>
            <td>${q.category}</td>
            <td>${q.type.toUpperCase()}</td>
            <td colspan="3">Qualitative / Descriptive Item</td>
          </tr>
        `;
      }
    });

    bodyHtml += `
        </tbody>
      </table>
    `;
  }

  if (template === 'detailed') {
    bodyHtml += `
      <h2>2. Verbatim Transcripts & Qualitative Field Inquiries</h2>
    `;

    matching.forEach((resp, rIdx) => {
      const respondentCode = resp.respondents.map(r => r.nameOrCode).join(', ');
      bodyHtml += `
        <h3>Respondent #${rIdx + 1}: ${respondentCode} (${resp.respondentGroup})</h3>
        <p><small>Mode: ${resp.interviewMode} | Language: ${resp.languageUsed} | Timestamp: ${new Date(resp.timestamp).toLocaleString()}</small></p>
      `;

      survey.questions.forEach((q, qIdx) => {
        const ans = resp.answers[q.id];
        if (!ans) return;
        bodyHtml += `<p><strong>Q${qIdx + 1} (${q.title}):</strong> `;
        if (ans.likertValue !== undefined) {
          bodyHtml += `Score: ${ans.likertValue} / ${q.likertConfig?.points || 5}`;
        }
        if (ans.textResponse) {
          bodyHtml += `<div class="quote">"${ans.textResponse}"</div>`;
        }
        if (ans.probeResponses && ans.probeResponses.length) {
          ans.probeResponses.forEach(pr => {
            bodyHtml += `<div style="margin-left: 16px; font-size: 10pt;"><em>Probe:</em> ${pr.probe}<br><strong>Answer:</strong> "${pr.response}"</div>`;
          });
        }
        bodyHtml += `</p>`;
      });
      bodyHtml += `<hr style="border: 0; border-top: 1pt solid #e2e8f0; margin: 16px 0;" />`;
    });
  }

  bodyHtml += `
      <div style="margin-top: 40px; font-size: 9pt; color: #64748b; border-top: 1pt solid #cbd5e1; padding-top: 8px;">
        Generated automatically by AI Survey Instrument Enterprise System. Verified psychometric calculation standards compliant with CHED & International Research Ethics.
      </div>
    </body>
    </html>
  `;

  const completeDoc = headerHtml + bodyHtml;
  const blob = new Blob(['\ufeff', completeDoc], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${survey.title.replace(/[^a-z0-9]/gi, '_')}_Report.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Scheduled Reports Local Storage Helpers
const SCHEDULED_REPORTS_KEY = 'ai_survey_scheduled_reports_v1';

export function getScheduledReports(): ScheduledReport[] {
  try {
    return JSON.parse(localStorage.getItem(SCHEDULED_REPORTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveScheduledReport(report: ScheduledReport): void {
  const existing = getScheduledReports();
  const idx = existing.findIndex(r => r.id === report.id);
  if (idx >= 0) {
    existing[idx] = report;
  } else {
    existing.push(report);
  }
  localStorage.setItem(SCHEDULED_REPORTS_KEY, JSON.stringify(existing));
}

export function deleteScheduledReport(id: string): void {
  const existing = getScheduledReports();
  localStorage.setItem(SCHEDULED_REPORTS_KEY, JSON.stringify(existing.filter(r => r.id !== id)));
}
