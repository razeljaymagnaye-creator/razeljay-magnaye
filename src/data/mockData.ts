/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Clearly labeled sample data for demonstrating the Survey Instrument System.
 * These are fictional examples and can be replaced with real research data.
 */
import { Survey, SurveyQuestion, SurveyResponse } from '../types/survey';

const agreementOptions = [
  { value: 1, label: 'Strongly disagree', shortLabel: 'SD' },
  { value: 2, label: 'Disagree', shortLabel: 'D' },
  { value: 3, label: 'Neutral', shortLabel: 'N' },
  { value: 4, label: 'Agree', shortLabel: 'A' },
  { value: 5, label: 'Strongly agree', shortLabel: 'SA' },
];

const makeQuestion = (
  id: string,
  title: string,
  prompt: string,
  category: string,
  options?: string[],
): SurveyQuestion => ({
  id,
  title,
  prompt,
  type: options ? 'multiple-choice' : 'likert',
  interviewType: 'structured',
  category,
  difficulty: 'Beginner',
  relevanceScore: 90,
  tags: [category, 'Sample Data'],
  likertConfig: options ? undefined : {
    points: 5,
    template: 'agreement',
    options: agreementOptions,
    allowNeutral: true,
  },
  options,
  translations: {},
  isMandatory: true,
});

const studentQuestions: SurveyQuestion[] = [
  makeQuestion('q-student-1', 'Learning resources', 'The learning materials provided for my classes are useful and easy to understand.', 'Learning Resources'),
  makeQuestion('q-student-2', 'Instructor support', 'My instructors explain difficult topics clearly and respond to questions.', 'Instructor Support'),
  makeQuestion('q-student-3', 'Learning platform', 'The online learning platform is reliable and easy to navigate.', 'Learning Platform'),
  makeQuestion('q-student-4', 'Overall satisfaction', 'Overall, I am satisfied with the quality of my learning experience.', 'Satisfaction'),
  makeQuestion('q-student-5', 'Improvement priority', 'Which area should the school prioritize improving?', 'Improvement', [
    'Learning materials', 'Instructor support', 'Online platform', 'Classroom facilities', 'Student services',
  ]),
];

const campusQuestions: SurveyQuestion[] = [
  makeQuestion('q-campus-1', 'Facility cleanliness', 'Campus facilities are clean and well-maintained.', 'Facilities'),
  makeQuestion('q-campus-2', 'Safety', 'I feel safe while walking around campus during school hours.', 'Safety'),
  makeQuestion('q-campus-3', 'Study spaces', 'There are enough comfortable spaces for individual or group study.', 'Study Spaces'),
  makeQuestion('q-campus-4', 'Accessibility', 'Campus facilities are accessible and convenient to reach.', 'Accessibility'),
  makeQuestion('q-campus-5', 'Improvement priority', 'Which campus service or facility needs the most improvement?', 'Improvement', [
    'Restrooms and cleanliness', 'Security and lighting', 'Library and study areas', 'Wi-Fi connectivity', 'Seating and common areas',
  ]),
];

export const INITIAL_SURVEYS: Survey[] = [
  {
    id: 'sample-survey-student-experience',
    title: 'Student Learning Experience',
    description: 'Sample survey exploring learning materials, instructor support, online learning tools, and overall student satisfaction.',
    targetRespondentGroup: 'College Students',
    interviewType: 'structured',
    defaultLanguage: 'en',
    questions: studentQuestions,
    createdAt: '2026-10-20T09:00:00.000Z',
    updatedAt: '2026-10-20T09:00:00.000Z',
    version: 1,
    tags: ['Education', 'Student Experience', 'Sample'],
    departmentOrAuthor: 'Sample Research Team',
  },
  {
    id: 'sample-survey-campus-facilities',
    title: 'Campus Facilities and Safety',
    description: 'Sample survey assessing cleanliness, campus safety, study spaces, and accessibility of campus facilities.',
    targetRespondentGroup: 'College Students and Campus Visitors',
    interviewType: 'structured',
    defaultLanguage: 'en',
    questions: campusQuestions,
    createdAt: '2026-10-20T09:15:00.000Z',
    updatedAt: '2026-10-20T09:15:00.000Z',
    version: 1,
    tags: ['Campus', 'Facilities', 'Safety', 'Sample'],
    departmentOrAuthor: 'Sample Research Team',
  },
];

export const INITIAL_QUESTION_BANK: SurveyQuestion[] = [
  ...studentQuestions,
  ...campusQuestions,
];

const makeResponse = (
  id: string,
  survey: Survey,
  respondentCode: string,
  group: string,
  timestamp: string,
  scores: number[],
  priority: string,
  notes: string,
): SurveyResponse => {
  const answers: SurveyResponse['answers'] = {};
  survey.questions.forEach((question, index) => {
    if (question.type === 'multiple-choice') {
      answers[question.id] = { questionId: question.id, selectedOptions: [priority] };
    } else {
      answers[question.id] = { questionId: question.id, likertValue: scores[index] ?? 3 };
    }
  });
  return {
    id,
    surveyId: survey.id,
    surveyTitle: survey.title,
    interviewType: 'structured',
    interviewMode: 'individual',
    respondentGroup: group,
    respondents: [{
      id: `respondent-${respondentCode}`,
      nameOrCode: respondentCode,
      group,
      ageGroup: '18–24',
      region: 'Philippines',
    }],
    answers,
    languageUsed: 'en',
    interviewerNotes: notes,
    timestamp,
    syncStatus: 'synced',
    sentimentScore: scores.reduce((sum, value) => sum + value, 0) / Math.max(scores.length, 1) / 5,
    sentimentLabel: scores.reduce((sum, value) => sum + value, 0) / Math.max(scores.length, 1) >= 4 ? 'Positive' : 'Neutral',
    keywords: survey.tags?.slice(0, 3) ?? [],
  };
};

export const INITIAL_RESPONSES: SurveyResponse[] = [
  makeResponse('sample-response-student-001', INITIAL_SURVEYS[0], 'S-001', 'College Students', '2026-10-21T08:30:00.000Z', [5, 4, 4, 5, 0], 'Learning materials', 'Student appreciates the clear learning materials and suggests adding more downloadable examples.'),
  makeResponse('sample-response-student-002', INITIAL_SURVEYS[0], 'S-002', 'College Students', '2026-10-21T09:15:00.000Z', [4, 4, 3, 4, 0], 'Online platform', 'Student finds instructor support helpful but reports occasional difficulty navigating the learning platform.'),
  makeResponse('sample-response-student-003', INITIAL_SURVEYS[0], 'S-003', 'College Students', '2026-10-21T10:00:00.000Z', [3, 5, 4, 4, 0], 'Instructor support', 'Student values approachable instructors and recommends more consultation hours.'),
  makeResponse('sample-response-campus-001', INITIAL_SURVEYS[1], 'C-001', 'College Students and Campus Visitors', '2026-10-22T08:45:00.000Z', [4, 4, 3, 4, 0], 'Library and study areas', 'Respondent feels generally safe and recommends additional quiet study spaces.'),
  makeResponse('sample-response-campus-002', INITIAL_SURVEYS[1], 'C-002', 'College Students and Campus Visitors', '2026-10-22T09:20:00.000Z', [3, 3, 4, 3, 0], 'Security and lighting', 'Respondent asks for better lighting near walkways and more visible security staff.'),
  makeResponse('sample-response-campus-003', INITIAL_SURVEYS[1], 'C-003', 'College Students and Campus Visitors', '2026-10-22T10:10:00.000Z', [5, 4, 5, 4, 0], 'Wi-Fi connectivity', 'Respondent is satisfied with cleanliness but suggests improving Wi-Fi coverage in study areas.'),
];
