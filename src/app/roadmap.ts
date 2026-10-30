export type StepStatus = 'done' | 'next' | 'planned';

export interface RoadmapStep {
  readonly n: number;
  readonly title: string;
  readonly status: StepStatus;
}

/**
 * Development roadmap shown on the home screen so the build is transparent.
 * This panel is removed before the public release (step 12).
 */
export const ROADMAP: readonly RoadmapStep[] = [
  { n: 0, title: 'App shell, theme, PWA and offline install', status: 'done' },
  { n: 1, title: 'Syllabus, 160 sample questions, content validator', status: 'done' },
  { n: 2, title: 'Branch and subject selection', status: 'done' },
  { n: 3, title: 'Practice mode with instant explanations', status: 'next' },
  { n: 4, title: 'Mock test: 65 questions, palette, timer, resume', status: 'planned' },
  { n: 5, title: 'GATE marking and negative marking', status: 'planned' },
  { n: 6, title: 'Scientific calculator', status: 'planned' },
  { n: 7, title: 'Results and progress analysis', status: 'planned' },
  { n: 8, title: 'Weak-topic engine and spaced revision', status: 'planned' },
  { n: 9, title: 'Study planner', status: 'planned' },
  { n: 10, title: 'Bookmarks and notes', status: 'planned' },
  { n: 11, title: 'Export and import progress', status: 'planned' },
  { n: 12, title: 'Docs, accessibility and performance pass', status: 'planned' },
];
