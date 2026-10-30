import type {
  BranchCode,
  QuestionBankFile,
  QuestionBranch,
  QuestionType,
  Subject,
  SyllabusFile,
} from '../domain/types';
import cseSyllabusJson from './syllabus/cse.json';
import eceSyllabusJson from './syllabus/ece.json';
import eeSyllabusJson from './syllabus/ee.json';
import meSyllabusJson from './syllabus/me.json';
import ceSyllabusJson from './syllabus/ce.json';
import gaSyllabusJson from './syllabus/general-aptitude.json';
import cseBankJson from './questions/cse.json';
import eceBankJson from './questions/ece.json';
import eeBankJson from './questions/ee.json';
import meBankJson from './questions/me.json';
import ceBankJson from './questions/ce.json';
import gaBankJson from './questions/general-aptitude.json';

/**
 * Static catalogue of every branch, syllabus and question bank.
 *
 * JSON is imported at build time (never fetched), so the app works offline and the
 * bundler can tree-shake nothing away by accident. The JSON is validated by
 * `scripts/validate-questions.mjs` before every build, which is why the casts below
 * are safe: TypeScript widens JSON strings to `string`, the validator enforces the
 * exact union types at build time.
 */
const SYLLABI: Record<QuestionBranch, SyllabusFile> = {
  CSE: cseSyllabusJson as unknown as SyllabusFile,
  ECE: eceSyllabusJson as unknown as SyllabusFile,
  EE: eeSyllabusJson as unknown as SyllabusFile,
  ME: meSyllabusJson as unknown as SyllabusFile,
  CE: ceSyllabusJson as unknown as SyllabusFile,
  GA: gaSyllabusJson as unknown as SyllabusFile,
};

const BANKS: Record<QuestionBranch, QuestionBankFile> = {
  CSE: cseBankJson as unknown as QuestionBankFile,
  ECE: eceBankJson as unknown as QuestionBankFile,
  EE: eeBankJson as unknown as QuestionBankFile,
  ME: meBankJson as unknown as QuestionBankFile,
  CE: ceBankJson as unknown as QuestionBankFile,
  GA: gaBankJson as unknown as QuestionBankFile,
};

export interface BranchInfo {
  readonly code: BranchCode;
  readonly name: string;
  readonly tagline: string;
}

/** Order shown in the picker. `name` comes from the syllabus file, so the two cannot drift. */
export const BRANCHES: readonly BranchInfo[] = (['CSE', 'ECE', 'EE', 'ME', 'CE'] as const).map(
  (code) => ({
    code,
    name: SYLLABI[code].name,
    tagline: {
      CSE: 'Algorithms, systems, theory, databases and networks.',
      ECE: 'Circuits, signals, communication, control and electromagnetics.',
      EE: 'Machines, power systems, control, measurements and power electronics.',
      ME: 'Thermodynamics, fluids, machines, design, manufacturing and materials.',
      CE: 'Structures, geotechnics, water, environment, transport and surveying.',
    }[code],
  }),
);

export function isBranchCode(value: string): value is BranchCode {
  return BRANCHES.some((branch) => branch.code === value);
}

export function getSyllabus(branch: QuestionBranch): SyllabusFile {
  return SYLLABI[branch];
}

export function getQuestionBank(branch: QuestionBranch): QuestionBankFile {
  return BANKS[branch];
}

export function getBranchInfo(code: BranchCode): BranchInfo {
  const info = BRANCHES.find((branch) => branch.code === code);
  if (!info) throw new Error(`Unknown branch "${code}"`);
  return info;
}

export interface TopicStat {
  readonly id: string;
  readonly name: string;
  readonly subtopics: readonly string[];
  readonly questions: number;
  readonly marks: number;
}

export interface SubjectStat {
  readonly id: string;
  readonly name: string;
  readonly weightage: number;
  readonly questions: number;
  readonly marks: number;
  readonly coveredTopics: number;
  readonly totalTopics: number;
  readonly topics: readonly TopicStat[];
}

const statsCache = new Map<QuestionBranch, readonly SubjectStat[]>();

/**
 * Real coverage numbers: how many questions and marks the bank holds for each subject
 * and topic. Topics with no questions are kept so gaps are visible instead of hidden.
 */
export function getSubjectStats(branch: QuestionBranch): readonly SubjectStat[] {
  const cached = statsCache.get(branch);
  if (cached) return cached;

  const syllabus = getSyllabus(branch);
  const bank = getQuestionBank(branch);

  const bySubject = new Map<string, Map<string, { questions: number; marks: number }>>();
  for (const question of bank.questions) {
    let topics = bySubject.get(question.subject);
    if (!topics) {
      topics = new Map();
      bySubject.set(question.subject, topics);
    }
    const entry = topics.get(question.topic) ?? { questions: 0, marks: 0 };
    entry.questions += 1;
    entry.marks += question.marks;
    topics.set(question.topic, entry);
  }

  const stats = syllabus.subjects.map((subject): SubjectStat => {
    const topics = subject.topics.map((topic): TopicStat => {
      const entry = bySubject.get(subject.id)?.get(topic.id);
      return {
        id: topic.id,
        name: topic.name,
        subtopics: topic.subtopics ?? [],
        questions: entry?.questions ?? 0,
        marks: entry?.marks ?? 0,
      };
    });
    const questions = topics.reduce((sum, topic) => sum + topic.questions, 0);
    const marks = topics.reduce((sum, topic) => sum + topic.marks, 0);
    return {
      id: subject.id,
      name: subject.name,
      weightage: subject.weightage,
      questions,
      marks,
      topics,
      coveredTopics: topics.filter((topic) => topic.questions > 0).length,
      totalTopics: topics.length,
    };
  });

  statsCache.set(branch, stats);
  return stats;
}

export interface Coverage {
  readonly subjects: number;
  readonly topics: number;
  readonly coveredTopics: number;
  readonly questions: number;
  readonly marks: number;
}

function summarise(stats: readonly SubjectStat[]): Coverage {
  return {
    subjects: stats.length,
    topics: stats.reduce((sum, subject) => sum + subject.totalTopics, 0),
    coveredTopics: stats.reduce((sum, subject) => sum + subject.coveredTopics, 0),
    questions: stats.reduce((sum, subject) => sum + subject.questions, 0),
    marks: stats.reduce((sum, subject) => sum + subject.marks, 0),
  };
}

export interface BranchSummary {
  readonly core: Coverage;
  readonly aptitude: Coverage;
  readonly questions: number;
  readonly marks: number;
}

const summaryCache = new Map<BranchCode, BranchSummary>();

/** Core paper coverage plus the shared General Aptitude section. */
export function getBranchSummary(branch: BranchCode): BranchSummary {
  const cached = summaryCache.get(branch);
  if (cached) return cached;

  const core = summarise(getSubjectStats(branch));
  const aptitude = summarise(getSubjectStats('GA'));
  const summary: BranchSummary = {
    core,
    aptitude,
    questions: core.questions + aptitude.questions,
    marks: core.marks + aptitude.marks,
  };
  summaryCache.set(branch, summary);
  return summary;
}

export type TypeCounts = Record<QuestionType, number>;

export function countQuestionTypes(branch: QuestionBranch): TypeCounts {
  const counts: TypeCounts = { MCQ: 0, MSQ: 0, NAT: 0 };
  for (const question of getQuestionBank(branch).questions) counts[question.type] += 1;
  return counts;
}

export interface SubjectView {
  readonly bankBranch: QuestionBranch;
  readonly subject: Subject;
  readonly stat: SubjectStat;
}

/** Resolves a subject id for the current branch, falling back to the shared GA syllabus. */
export function findSubject(branch: BranchCode, subjectId: string): SubjectView | null {
  const candidates: readonly QuestionBranch[] = [branch, 'GA'];
  for (const bankBranch of candidates) {
    const stat = getSubjectStats(bankBranch).find((entry) => entry.id === subjectId);
    if (!stat) continue;
    const subject = getSyllabus(bankBranch).subjects.find((entry) => entry.id === subjectId);
    if (subject) return { bankBranch, subject, stat };
  }
  return null;
}

/** Percentage of topics in a branch that already have at least one sample question. */
export function coveragePercent(covered: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((covered / total) * 100);
}
