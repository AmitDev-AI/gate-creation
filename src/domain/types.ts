export type BranchCode = 'CSE' | 'ECE' | 'EE' | 'ME' | 'CE';
export type QuestionBranch = BranchCode | 'GA';
export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type OptionId = 'A' | 'B' | 'C' | 'D';
export type QuestionSource = 'sample' | 'community';

export interface QuestionOption {
  id: OptionId;
  text: string;
}

export interface NatAnswer {
  /** Inclusive lower bound. Equal to `max` for an exact integer answer. */
  min: number;
  max: number;
}

interface QuestionBase {
  id: string;
  branch: QuestionBranch;
  subject: string;
  topic: string;
  marks: 1 | 2;
  difficulty: Difficulty;
  source: QuestionSource;
  question: string;
  explanation: string;
  tags?: string[];
}

export interface McqQuestion extends QuestionBase {
  type: 'MCQ';
  options: QuestionOption[];
  answer: OptionId;
}

export interface MsqQuestion extends QuestionBase {
  type: 'MSQ';
  options: QuestionOption[];
  /** Two or more correct options. All and only these must be selected for marks. */
  answer: OptionId[];
}

export interface NatQuestion extends QuestionBase {
  type: 'NAT';
  answer: NatAnswer;
  unit?: string;
}

export type Question = McqQuestion | MsqQuestion | NatQuestion;

export interface QuestionBankFile {
  branch: QuestionBranch;
  version: string;
  questions: Question[];
}

export interface Topic {
  id: string;
  name: string;
  subtopics?: string[];
  expectedHours?: number;
}

export interface Subject {
  id: string;
  name: string;
  /** Approximate share of the core paper, in percent. Must sum to 100 per branch. */
  weightage: number;
  topics: Topic[];
}

export interface SyllabusFile {
  branch: QuestionBranch;
  name: string;
  version: string;
  subjects: Subject[];
}
