/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InterviewType = 'structured' | 'semi-structured' | 'unstructured';
export type InterviewMode = 'individual' | 'group' | 'random';
export type QuestionType = 'likert' | 'multiple-choice' | 'open-ended' | 'rating-scale';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type LikertTemplateKey = 'agreement' | 'satisfaction' | 'frequency' | 'importance' | 'forced' | 'custom';

export interface LikertOption {
  value: number;
  label: string;
  shortLabel?: string;
  tag?: string;
  color?: string;
}

export interface LikertConfig {
  points: number; // 4, 5, 7, 10
  template: LikertTemplateKey;
  options: LikertOption[];
  allowNeutral?: boolean;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  prompt: string;
  type: QuestionType;
  interviewType: InterviewType;
  category: string;
  difficulty: DifficultyLevel;
  relevanceScore: number; // 0 - 100
  tags: string[];
  probes?: string[]; // exploratory follow-up probes (semi-structured)
  likertConfig?: LikertConfig;
  options?: string[]; // for multiple choice
  translations: Record<string, string>; // e.g. { tl: '...', ceb: '...' }
  isMandatory?: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  targetRespondentGroup: string;
  interviewType: InterviewType;
  defaultLanguage: string; // e.g., 'en' | 'tl' | 'ceb'
  questions: SurveyQuestion[]; // Up to 50 questions
  createdAt: string;
  updatedAt: string;
  version: number;
  tags?: string[];
  departmentOrAuthor?: string;
}

export interface RespondentProfile {
  id: string;
  nameOrCode: string;
  group: string; // e.g. 'Undergraduate Students'
  ageGroup?: string;
  gender?: string;
  region?: string;
}

export interface AnswerRecord {
  questionId: string;
  likertValue?: number;
  selectedOptions?: string[];
  textResponse?: string;
  speakerTag?: string; // For group interviews (e.g., 'Respondent 2')
  probeResponses?: Array<{ probe: string; response: string }>;
  interviewerNotes?: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  surveyTitle: string;
  interviewType: InterviewType;
  interviewMode: InterviewMode;
  respondentGroup: string;
  respondents: RespondentProfile[];
  answers: Record<string, AnswerRecord>;
  languageUsed: string;
  interviewerNotes?: string;
  audioRecorded?: boolean;
  audioDurationSeconds?: number;
  timestamp: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  isEncryptedOffline?: boolean;
  sentimentScore?: number; // -1 to 1
  sentimentLabel?: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  keywords?: string[];
  conflictDetails?: string;
}

export interface ScheduledReport {
  id: string;
  surveyId: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'on-completion';
  template: 'summary' | 'detailed' | 'comparative';
  recipients: string[];
  format: 'pdf' | 'docx' | 'xlsx';
  nextRunDate: string;
  active: boolean;
}

export interface SentimentAnalysisResult {
  sentimentScore: number;
  sentimentLabel: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keywords: Array<{
    word: string;
    count: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    weight: number;
  }>;
  themes: Array<{
    theme: string;
    description: string;
    relevance: number;
  }>;
  summary: string;
  recommendedAction?: string;
}

export type UserRole = 'admin' | 'interviewer' | 'analyst';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institution?: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
}

export type RequirementCategory = 'functional' | 'non-functional' | 'pain-point' | 'user-story';
export type RequirementPriority = 'critical' | 'high' | 'medium' | 'low';
export type RequirementStatus = 'identified' | 'in-review' | 'validated' | 'deferred';

export interface RequirementItem {
  id: string;
  code: string; // e.g. "FR-101", "NFR-04", "PP-12", "US-08"
  title: string;
  description: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  status: RequirementStatus;
  surveyId: string;
  sourceInterviewId?: string;
  stakeholderName?: string;
  consensusScore?: number; // 0-100%
  likertScore?: number; // 1-5
  tags: string[];
  acceptanceCriteria?: string[];
  createdAt: string;
}

