export interface Certification {
  id: string;                     // URL hash + data folder name
  title: string;                  // full name, landing card + HomePage h1
  shortTitle: string;             // header brand
  provider: string;               // "ISTQB", "Anthropic"
  description: string;
  status: 'available' | 'wip';
  storagePrefix: string;          // localStorage namespace
}

export const CERTIFICATIONS: Certification[] = [
  {
    id: 'istqb-tae',
    title: 'ISTQB CTAL-TAE Preparation',
    shortTitle: 'ISTQB TAE Prep',
    provider: 'ISTQB',
    description: 'Practice questions for the ISTQB Certified Tester Advanced Level Test Automation Engineering exam.',
    status: 'available',
    storagePrefix: 'tae',
  },
  {
    id: 'istqb-genai',
    title: 'ISTQB GEN AI',
    shortTitle: 'ISTQB GenAI',
    provider: 'ISTQB',
    description: 'Practice questions for the ISTQB Generative AI certification.',
    status: 'wip',
    storagePrefix: 'genai',
  },
  {
    id: 'ccdv-f',
    title: 'Claude Certified Developer – Foundations (CCDV-F)',
    shortTitle: 'CCDV-F',
    provider: 'Anthropic',
    description: 'Practice questions for the Claude Certified Developer – Foundations certification.',
    status: 'wip',
    storagePrefix: 'ccdvf',
  },
];

export function getCertification(id: string): Certification | undefined {
  return CERTIFICATIONS.find(c => c.id === id);
}
