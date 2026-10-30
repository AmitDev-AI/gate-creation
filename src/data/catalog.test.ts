import { describe, expect, it } from 'vitest';
import type { BranchCode, QuestionBranch } from '../domain/types';
import {
  BRANCHES,
  countQuestionTypes,
  coveragePercent,
  findSubject,
  getBranchInfo,
  getBranchSummary,
  getQuestionBank,
  getSubjectStats,
  getSyllabus,
  isBranchCode,
} from './catalog';

const BRANCH_CODES: readonly BranchCode[] = ['CSE', 'ECE', 'EE', 'ME', 'CE'];
const ALL_BANKS: readonly QuestionBranch[] = [...BRANCH_CODES, 'GA'];

describe('branch catalogue', () => {
  it('lists exactly the supported branches', () => {
    expect(BRANCHES.map((branch) => branch.code)).toEqual(BRANCH_CODES);
  });

  it('rejects codes that are not branches', () => {
    expect(isBranchCode('CSE')).toBe(true);
    expect(isBranchCode('GA')).toBe(false);
    expect(isBranchCode('cse')).toBe(false);
    expect(isBranchCode('')).toBe(false);
  });

  it('keeps the display name in sync with the syllabus file', () => {
    for (const code of BRANCH_CODES) {
      expect(getBranchInfo(code).name).toBe(getSyllabus(code).name);
    }
  });
});

describe('syllabus and bank consistency', () => {
  it('has subject weightage that sums to 100 in every syllabus', () => {
    for (const bank of ALL_BANKS) {
      const total = getSyllabus(bank).subjects.reduce(
        (sum, subject) => sum + subject.weightage,
        0,
      );
      expect(total, `${bank} weightage`).toBe(100);
    }
  });

  it('labels each file with its own branch', () => {
    for (const bank of ALL_BANKS) {
      expect(getSyllabus(bank).branch).toBe(bank);
      expect(getQuestionBank(bank).branch).toBe(bank);
    }
  });

  it('accounts for every question in the bank exactly once', () => {
    for (const bank of ALL_BANKS) {
      const stats = getSubjectStats(bank);
      const counted = stats.reduce((sum, subject) => sum + subject.questions, 0);
      expect(counted, `${bank} question coverage`).toBe(getQuestionBank(bank).questions.length);
    }
  });

  it('sums topic stats up to their subject stats', () => {
    for (const bank of ALL_BANKS) {
      for (const subject of getSubjectStats(bank)) {
        const questions = subject.topics.reduce((sum, topic) => sum + topic.questions, 0);
        const marks = subject.topics.reduce((sum, topic) => sum + topic.marks, 0);
        expect(questions, `${subject.id} questions`).toBe(subject.questions);
        expect(marks, `${subject.id} marks`).toBe(subject.marks);
        expect(subject.coveredTopics).toBeLessThanOrEqual(subject.totalTopics);
      }
    }
  });

  it('counts every question type and nothing else', () => {
    for (const bank of ALL_BANKS) {
      const counts = countQuestionTypes(bank);
      const total = counts.MCQ + counts.MSQ + counts.NAT;
      expect(total, `${bank} type total`).toBe(getQuestionBank(bank).questions.length);
    }
  });
});

describe('branch summary', () => {
  it('adds the shared aptitude bank to the core paper', () => {
    const core = getSubjectStats('CSE').reduce((sum, subject) => sum + subject.questions, 0);
    const aptitude = getSubjectStats('GA').reduce((sum, subject) => sum + subject.questions, 0);
    const summary = getBranchSummary('CSE');

    expect(summary.core.questions).toBe(core);
    expect(summary.aptitude.questions).toBe(aptitude);
    expect(summary.questions).toBe(core + aptitude);
  });

  it('gives every branch the same aptitude section', () => {
    const aptitude = getBranchSummary('CSE').aptitude;
    for (const code of BRANCH_CODES) {
      expect(getBranchSummary(code).aptitude).toEqual(aptitude);
    }
  });
});

describe('subject lookup', () => {
  it('finds a core subject for its own branch', () => {
    const view = findSubject('CSE', 'cse-os');
    expect(view?.bankBranch).toBe('CSE');
    expect(view?.subject.name).toBe('Operating Systems');
  });

  it('does not leak a core subject into another branch', () => {
    expect(findSubject('ECE', 'cse-os')).toBeNull();
  });

  it('finds shared aptitude subjects from any branch', () => {
    for (const code of BRANCH_CODES) {
      expect(findSubject(code, 'ga-quant')?.bankBranch).toBe('GA');
    }
  });

  it('returns null for unknown subjects', () => {
    expect(findSubject('CSE', 'nope')).toBeNull();
    expect(findSubject('CSE', '')).toBeNull();
  });
});

describe('coveragePercent', () => {
  it('rounds to the nearest whole percent', () => {
    expect(coveragePercent(1, 3)).toBe(33);
    expect(coveragePercent(2, 3)).toBe(67);
    expect(coveragePercent(3, 3)).toBe(100);
  });

  it('never divides by zero', () => {
    expect(coveragePercent(0, 0)).toBe(0);
  });
});
