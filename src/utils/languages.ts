/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  isDialect: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'Global / Standard', isDialect: false },
  { code: 'tl', name: 'Tagalog (Filipino)', nativeName: 'Wikang Filipino / Tagalog', region: 'National / Luzon', isDialect: false },
  { code: 'ceb', name: 'Cebuano (Bisaya)', nativeName: 'Binisaya / Sinugboanon', region: 'Visayas & Mindanao', isDialect: true },
  { code: 'ilo', name: 'Ilocano', nativeName: 'Ilokano', region: 'Northern Luzon / Ilocos', isDialect: true },
  { code: 'hil', name: 'Hiligaynon (Ilonggo)', nativeName: 'Hiligaynon / Ilonggo', region: 'Western Visayas / Panay', isDialect: true },
  { code: 'bcl', name: 'Bikolano', nativeName: 'Bikol', region: 'Bicol Region', isDialect: true },
  { code: 'war', name: 'Waray-Waray', nativeName: 'Winaray', region: 'Eastern Visayas / Samar & Leyte', isDialect: true },
  { code: 'pam', name: 'Kapampangan', nativeName: 'Amanung Sisuan', region: 'Central Luzon / Pampanga', isDialect: true },
  { code: 'pag', name: 'Pangasinense', nativeName: 'Salitan Pangasinan', region: 'Pangasinan', isDialect: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'International', isDialect: false },
];

export const LIKERT_TRANSLATIONS: Record<string, Record<number, string>> = {
  // 5-point Agreement
  agreement_tl: {
    1: 'Lubos na Hindi Sumasang-ayon',
    2: 'Hindi Sumasang-ayon',
    3: 'Walang Kinikilingan (Neutral)',
    4: 'Sumasang-ayon',
    5: 'Lubos na Sumasang-ayon',
  },
  agreement_ceb: {
    1: 'Dako gayud nga Dili Mouyon',
    2: 'Dili Mouyon',
    3: 'Neyutral',
    4: 'Mouyon',
    5: 'Dako gayud nga Mouyon',
  },
  agreement_ilo: {
    1: 'Madi a Madi a Makitunos',
    2: 'Madi a Makitunos',
    3: 'Patas / Neutral',
    4: 'Makitunos',
    5: 'Uray pay ket Makitunos',
  },
  agreement_hil: {
    1: 'Wala gid naga-ugyon',
    2: 'Wala naga-ugyon',
    3: 'Neyutral',
    4: 'Naga-ugyon',
    5: 'Ugyon gid katama',
  },
  agreement_bcl: {
    1: 'Bako nanggad Uyon',
    2: 'Bako Uyon',
    3: 'Neutral',
    4: 'Uyon',
    5: 'Uyon na Uyon',
  },
  agreement_war: {
    1: 'Diri gud Naoyon',
    2: 'Diri Naoyon',
    3: 'Neutral',
    4: 'Naoyon',
    5: 'Uyon gud Hin Duro',
  },
};

export function getLanguageName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? `${lang.name} (${lang.nativeName})` : code;
}
