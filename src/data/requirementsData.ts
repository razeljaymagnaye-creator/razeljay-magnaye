/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RequirementItem, SurveyResponse, Survey } from '../types/survey';

export const INITIAL_REQUIREMENTS: RequirementItem[] = [
  {
    id: 'req-01',
    code: 'FR-101',
    title: 'Offline LMS Local Caching & Auto-Draft Recovery',
    description: 'System must automatically persist student assessment responses in encrypted IndexedDB storage, enabling seamless offline exam completion without data loss during sudden connectivity drops.',
    category: 'functional',
    priority: 'critical',
    status: 'validated',
    surveyId: 'survey-structured-01',
    sourceInterviewId: 'resp-001',
    stakeholderName: 'Dr. Ronald Vance (Dean of Academic Tech)',
    consensusScore: 94,
    likertScore: 4.8,
    tags: ['Offline', 'LMS', 'Assessment', 'Resilience'],
    acceptanceCriteria: [
      'Responses cached locally every 2 seconds without UI freeze',
      'Automatic sync trigger when navigator.onLine becomes true',
      'Visual indicator showing number of uncommitted local drafts',
    ],
    createdAt: '2026-10-22T09:30:00Z',
  },
  {
    id: 'req-02',
    code: 'NFR-201',
    title: 'Sub-500ms End-to-End Sync Latency',
    description: 'Cloud sync protocol must complete encrypted payload exchange within 500ms under 3G/intermittent cellular network conditions in regional campuses.',
    category: 'non-functional',
    priority: 'high',
    status: 'validated',
    surveyId: 'survey-structured-01',
    sourceInterviewId: 'resp-002',
    stakeholderName: 'Engr. Carlo Reyes (Infrastructure Lead)',
    consensusScore: 91,
    likertScore: 4.6,
    tags: ['Performance', 'Latency', 'Cellular', 'Sync'],
    acceptanceCriteria: [
      'Gzip or Brotli payload compression under 40KB per batch',
      'Backoff exponential retry with maximum 3 retries',
      'Non-blocking background thread execution',
    ],
    createdAt: '2026-10-22T11:15:00Z',
  },
  {
    id: 'req-03',
    code: 'PP-301',
    title: 'Synchronous Lecture Screen Fatigue & Cognitive Overload',
    description: 'Over 78% of student respondents report extreme eye strain and mental exhaustion after continuous 3+ hour video sessions without structured interactive micro-breaks.',
    category: 'pain-point',
    priority: 'high',
    status: 'in-review',
    surveyId: 'survey-structured-01',
    sourceInterviewId: 'resp-003',
    stakeholderName: 'Maria Santos (Student Council President)',
    consensusScore: 88,
    likertScore: 4.4,
    tags: ['Wellbeing', 'Cognitive Load', 'Screen Time', 'Pedagogy'],
    acceptanceCriteria: [
      'Mandatory 10-minute break timer after 50 minutes of continuous meeting',
      'Asynchronous micro-lecture summaries provided within 1 hour post-class',
      'Dark mode and high-contrast color scheme default option',
    ],
    createdAt: '2026-10-23T14:00:00Z',
  },
  {
    id: 'req-04',
    code: 'FR-102',
    title: 'Multilingual Philippine Dialect Prompt Engine',
    description: 'System must render survey questions, psychological assessments, and instructional probes natively in English, Tagalog, Cebuano, and Ilocano with dynamic dialect switching.',
    category: 'functional',
    priority: 'high',
    status: 'validated',
    surveyId: 'survey-structured-01',
    sourceInterviewId: 'resp-004',
    stakeholderName: 'Prof. Elena Dimagiba (Psychometrics Lead)',
    consensusScore: 96,
    likertScore: 4.9,
    tags: ['Localization', 'Multilingual', 'Tagalog', 'Cebuano'],
    acceptanceCriteria: [
      'Instant client-side translation switch without page reload',
      'Culturally validated Likert scale anchors in each dialect',
      'Audio read-aloud support for low-literacy survey respondents',
    ],
    createdAt: '2026-10-24T08:45:00Z',
  },
  {
    id: 'req-05',
    code: 'NFR-202',
    title: 'Zero-Knowledge Client-Side AES-256 Storage Encryption',
    description: 'All offline survey responses, audio notes, and respondent identifiers must be encrypted in client IndexedDB storage using AES-256-GCM before write.',
    category: 'non-functional',
    priority: 'critical',
    status: 'validated',
    surveyId: 'survey-structured-01',
    sourceInterviewId: 'resp-001',
    stakeholderName: 'Security & Compliance Board',
    consensusScore: 98,
    likertScore: 5.0,
    tags: ['Security', 'Encryption', 'Privacy', 'Compliance'],
    acceptanceCriteria: [
      'Keys derived from session PBKDF2 with 100,000 iterations',
      'No plaintext participant PII in browser localStorage',
      'Cryptographic zeroing of memory upon logout',
    ],
    createdAt: '2026-10-24T16:20:00Z',
  },
  {
    id: 'req-06',
    code: 'US-401',
    title: 'As an interviewer, I want real-time dynamic probing suggestions',
    description: 'During semi-structured stakeholder interviews, the interviewer needs context-aware follow-up probes based on the participant’s sentiment and Likert rating.',
    category: 'user-story',
    priority: 'medium',
    status: 'in-review',
    surveyId: 'survey-semi-02',
    sourceInterviewId: 'resp-005',
    stakeholderName: 'Mark Bautista (Field Researcher)',
    consensusScore: 85,
    likertScore: 4.2,
    tags: ['AI Probes', 'Semi-Structured', 'UX', 'Interviewing'],
    acceptanceCriteria: [
      'Displays 2-3 tailored probing questions when negative sentiment is detected',
      'One-tap probe selection that appends note to current response record',
      'Supports audio recording timestamp tagging for key respondent quotes',
    ],
    createdAt: '2026-10-25T10:10:00Z',
  },
  {
    id: 'req-07',
    code: 'FR-103',
    title: 'Multi-Format Specification Export (PRD, Word, CSV, PDF)',
    description: 'Project managers and analysts must be able to export synthesized requirements, stakeholder quotes, and psychometric consensus charts into PRD, DOCX, and CSV spreadsheets.',
    category: 'functional',
    priority: 'high',
    status: 'validated',
    surveyId: 'survey-structured-01',
    sourceInterviewId: 'resp-006',
    stakeholderName: 'Product Management Guild',
    consensusScore: 92,
    likertScore: 4.7,
    tags: ['Export', 'PRD', 'Reporting', 'Word', 'CSV'],
    acceptanceCriteria: [
      'One-click PRD generation with Executive Summary and Traceability Matrix',
      'Offline generation without external third-party API dependencies',
      'Direct print stylesheet optimized for A4 executive reports',
    ],
    createdAt: '2026-10-25T15:30:00Z',
  },
  {
    id: 'req-08',
    code: 'PP-302',
    title: 'Anonymous Mental Health Resource Stigma',
    description: 'Students avoid university psychological counseling due to fear of academic record tagging and lack of complete anonymity in digital booking workflows.',
    category: 'pain-point',
    priority: 'high',
    status: 'identified',
    surveyId: 'survey-structured-01',
    sourceInterviewId: 'resp-002',
    stakeholderName: 'Counseling & Guidance Division',
    consensusScore: 89,
    likertScore: 4.5,
    tags: ['Mental Health', 'Anonymity', 'Stigma', 'Privacy'],
    acceptanceCriteria: [
      'Anonymous pseudorandom student identifier for guidance requests',
      'Strict separation between academic grade records and wellness visits',
      'Zero telemetry logging on self-assessment questionnaires',
    ],
    createdAt: '2026-10-26T08:00:00Z',
  },
];

// Helper to extract or derive requirements from survey responses
export function deriveRequirementsFromResponses(
  responses: SurveyResponse[],
  surveys: Survey[]
): RequirementItem[] {
  // Return preloaded + any dynamic items from responses with interviewer notes
  const items = [...INITIAL_REQUIREMENTS];
  
  responses.forEach((resp, idx) => {
    if (resp.interviewerNotes && resp.interviewerNotes.length > 20) {
      const existing = items.find(i => i.sourceInterviewId === resp.id);
      if (!existing) {
        items.push({
          id: `req-dyn-${resp.id}`,
          code: `FR-${200 + idx}`,
          title: `Stakeholder Requirement: ${resp.respondentGroup}`,
          description: resp.interviewerNotes,
          category: 'functional',
          priority: resp.sentimentLabel === 'Negative' ? 'critical' : 'medium',
          status: 'identified',
          surveyId: resp.surveyId,
          sourceInterviewId: resp.id,
          stakeholderName: resp.respondents[0]?.nameOrCode || 'Stakeholder',
          consensusScore: resp.sentimentScore ? Math.round((resp.sentimentScore + 1) * 50) : 80,
          likertScore: 4.0,
          tags: ['Stakeholder Insight', resp.interviewType, resp.respondentGroup],
          acceptanceCriteria: ['Validate with engineering lead', 'Schedule prototype probe'],
          createdAt: resp.timestamp || new Date().toISOString(),
        });
      }
    }
  });

  return items;
}
