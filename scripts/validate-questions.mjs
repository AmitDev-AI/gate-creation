#!/usr/bin/env node
/**
 * Content validator for GATE Prep Hub.
 *
 * Zero dependencies. Run it before every build (`prebuild`) and every test run
 * (`pretest`) so a broken JSON file can never reach the app.
 *
 *   node scripts/validate-questions.mjs            # every bank
 *   node scripts/validate-questions.mjs ga cse     # only these banks
 *
 * It checks the syllabus and question schema, cross-references every question
 * to a real subject and topic, enforces the GATE option rules, rejects
 * duplicate ids and duplicate question text, and prints a per-bank summary.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SYLLABUS_DIR = join('src', 'data', 'syllabus');
const QUESTIONS_DIR = join('src', 'data', 'questions');

/** One entry per supported bank. `key` is what the CLI accepts. */
const BANKS = [
  { key: 'ga', branch: 'GA', syllabus: 'general-aptitude.json', questions: 'general-aptitude.json' },
  { key: 'cse', branch: 'CSE', syllabus: 'cse.json', questions: 'cse.json' },
  { key: 'ece', branch: 'ECE', syllabus: 'ece.json', questions: 'ece.json' },
  { key: 'ee', branch: 'EE', syllabus: 'ee.json', questions: 'ee.json' },
  { key: 'me', branch: 'ME', syllabus: 'me.json', questions: 'me.json' },
  { key: 'ce', branch: 'CE', syllabus: 'ce.json', questions: 'ce.json' },
];

const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);
const SOURCES = new Set(['sample', 'community']);
const OPTION_IDS = ['A', 'B', 'C', 'D'];
const TYPES = new Set(['MCQ', 'MSQ', 'NAT']);

const errors = [];
const warnings = [];
let errorCount = 0;

function fail(where, message) {
  errorCount += 1;
  errors.push(`${where}: ${message}`);
}

function warn(where, message) {
  warnings.push(`${where}: ${message}`);
}

function readJson(path) {
  if (!existsSync(path)) {
    fail(path, 'file does not exist');
    return null;
  }
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    fail(path, `cannot be read (${error.message})`);
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(path, `is not valid JSON (${error.message})`);
    return null;
  }
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalise(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Validates one syllabus file and returns a branch -> subject -> topic index. */
function validateSyllabus(bank) {
  const path = join(SYLLABUS_DIR, bank.syllabus);
  const file = readJson(path);
  const where = bank.syllabus;
  const index = new Map();

  if (!file) return index;

  if (!isObject(file)) {
    fail(where, 'top level must be an object');
    return index;
  }
  if (file.branch !== bank.branch) {
    fail(where, `branch is "${file.branch}", expected "${bank.branch}"`);
  }
  if (!isText(file.name)) fail(where, 'name is required');
  if (!isText(file.version)) fail(where, 'version is required');
  if (!Array.isArray(file.subjects) || file.subjects.length === 0) {
    fail(where, 'subjects must be a non-empty array');
    return index;
  }

  const subjectIds = new Set();
  let weightage = 0;
  let topicCount = 0;

  for (const [subjectIndex, subject] of file.subjects.entries()) {
    const label = `${where} subjects[${subjectIndex}]`;
    if (!isObject(subject)) {
      fail(label, 'must be an object');
      continue;
    }
    if (!isText(subject.id)) fail(label, 'id is required');
    if (!isText(subject.name)) fail(label, 'name is required');
    if (typeof subject.weightage !== 'number' || subject.weightage < 0) {
      fail(label, 'weightage must be a non-negative number');
    } else {
      weightage += subject.weightage;
    }
    if (isText(subject.id)) {
      if (subjectIds.has(subject.id)) fail(label, `duplicate subject id "${subject.id}"`);
      subjectIds.add(subject.id);
      if (!subject.id.startsWith(`${bank.key}-`)) {
        warn(label, `subject id "${subject.id}" does not start with "${bank.key}-"`);
      }
    }
    if (!Array.isArray(subject.topics) || subject.topics.length === 0) {
      fail(label, 'topics must be a non-empty array');
      continue;
    }

    const topics = new Map();
    for (const [topicIndex, topic] of subject.topics.entries()) {
      const topicLabel = `${label}.topics[${topicIndex}]`;
      if (!isObject(topic)) {
        fail(topicLabel, 'must be an object');
        continue;
      }
      if (!isText(topic.id)) fail(topicLabel, 'id is required');
      if (!isText(topic.name)) fail(topicLabel, 'name is required');
      if (isText(topic.id)) {
        if (topics.has(topic.id)) fail(topicLabel, `duplicate topic id "${topic.id}"`);
        topics.set(topic.id, topic.name);
        topicCount += 1;
        if (!topic.id.startsWith(`${subject.id}-`)) {
          warn(topicLabel, `topic id "${topic.id}" does not start with "${subject.id}-"`);
        }
      }
      if (topic.subtopics !== undefined) {
        if (!Array.isArray(topic.subtopics) || topic.subtopics.some((item) => !isText(item))) {
          fail(topicLabel, 'subtopics must be an array of non-empty strings');
        }
      }
      if (topic.expectedHours !== undefined) {
        if (typeof topic.expectedHours !== 'number' || topic.expectedHours <= 0) {
          fail(topicLabel, 'expectedHours must be a positive number');
        }
      }
    }

    if (isText(subject.id)) index.set(subject.id, topics);
  }

  if (weightage !== 100) {
    fail(where, `subject weightage sums to ${weightage}, expected 100`);
  }

  console.log(
    `  ${bank.branch.padEnd(3)} ${String(file.subjects.length).padStart(2)} subjects, ` +
      `${String(topicCount).padStart(2)} topics, weightage ${weightage}`,
  );

  return index;
}

function validateOptions(question, where) {
  const ids = [];
  for (const [index, option] of question.options.entries()) {
    const label = `${where}.options[${index}]`;
    if (!isObject(option)) {
      fail(label, 'must be an object');
      continue;
    }
    if (!OPTION_IDS.includes(option.id)) {
      fail(label, `id must be one of ${OPTION_IDS.join(', ')}`);
    } else {
      ids.push(option.id);
    }
    if (!isText(option.text)) fail(label, 'text is required');
  }

  if (ids.length !== 4 || new Set(ids).size !== 4) {
    fail(where, `options must contain exactly ${OPTION_IDS.join(', ')} once each`);
    return;
  }
  if (ids.join('') !== OPTION_IDS.join('')) {
    fail(where, `options must be ordered ${OPTION_IDS.join(', ')} (got ${ids.join(', ')})`);
  }

  const texts = question.options.map((option) => normalise(String(option.text ?? '')));
  if (new Set(texts).size !== texts.length) {
    fail(where, 'two options have identical text');
  }
}

function validateQuestion(question, bank, index, stats, seenIds, seenTexts) {
  const where = isObject(question) && isText(question.id) ? question.id : `${bank.key} question`;

  if (!isObject(question)) {
    fail(where, 'must be an object');
    return;
  }

  if (!isText(question.id)) {
    fail(where, 'id is required');
  } else {
    if (!/^[a-z]{2,3}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(question.id)) {
      fail(where, 'id must be lowercase letters, digits and hyphens (e.g. cse-os-001)');
    }
    if (seenIds.has(question.id)) {
      fail(where, `duplicate id (already used in the ${seenIds.get(question.id)} bank)`);
    } else {
      seenIds.set(question.id, bank.key);
    }
  }

  if (question.branch !== bank.branch) {
    fail(where, `branch is "${question.branch}", expected "${bank.branch}"`);
  }

  if (!isText(question.subject)) {
    fail(where, 'subject is required');
  } else {
    const topics = index.get(question.subject);
    if (!topics) {
      fail(where, `unknown subject "${question.subject}" for ${bank.branch}`);
    } else if (!isText(question.topic)) {
      fail(where, 'topic is required');
    } else if (!topics.has(question.topic)) {
      fail(where, `unknown topic "${question.topic}" in subject "${question.subject}"`);
    }
  }

  if (question.marks !== 1 && question.marks !== 2) {
    fail(where, 'marks must be 1 or 2');
  }
  if (!DIFFICULTIES.has(question.difficulty)) {
    fail(where, `difficulty must be one of ${[...DIFFICULTIES].join(', ')}`);
  }
  if (!SOURCES.has(question.source)) {
    fail(where, `source must be one of ${[...SOURCES].join(', ')}`);
  }
  if (!TYPES.has(question.type)) {
    fail(where, `type must be one of ${[...TYPES].join(', ')}`);
  }

  if (!isText(question.question) || question.question.trim().length < 15) {
    fail(where, 'question text must be at least 15 characters');
  } else {
    const key = normalise(question.question);
    if (seenTexts.has(key)) {
      fail(where, `duplicate question text (already used by ${seenTexts.get(key)})`);
    } else {
      seenTexts.set(key, question.id);
    }
  }

  if (!isText(question.explanation) || question.explanation.trim().length < 40) {
    fail(where, 'explanation must be at least 40 characters');
  }

  if (question.tags !== undefined) {
    if (!Array.isArray(question.tags) || question.tags.some((tag) => !isText(tag))) {
      fail(where, 'tags must be an array of non-empty strings');
    }
  }

  if (question.type === 'MCQ' || question.type === 'MSQ') {
    if (!Array.isArray(question.options)) {
      fail(where, 'options must be an array');
      return;
    }
    validateOptions(question, where);

    if (question.type === 'MCQ') {
      if (!OPTION_IDS.includes(question.answer)) {
        fail(where, `MCQ answer must be one of ${OPTION_IDS.join(', ')}`);
      }
    } else {
      if (!Array.isArray(question.answer) || question.answer.length < 2) {
        fail(where, 'MSQ answer must be an array of at least two option ids');
      } else {
        if (new Set(question.answer).size !== question.answer.length) {
          fail(where, 'MSQ answer contains duplicates');
        }
        for (const id of question.answer) {
          if (!OPTION_IDS.includes(id)) {
            fail(where, `MSQ answer contains unknown option "${id}"`);
          }
        }
        if (question.answer.length > 3) {
          warn(where, 'MSQ with all four options correct is unusual for GATE');
        }
      }
    }
  }

  if (question.type === 'NAT') {
    if (question.options !== undefined) {
      fail(where, 'NAT questions must not have options');
    }
    if (!isObject(question.answer)) {
      fail(where, 'NAT answer must be an object { min, max }');
    } else {
      const { min, max } = question.answer;
      if (typeof min !== 'number' || !Number.isFinite(min)) {
        fail(where, 'NAT answer.min must be a finite number');
      }
      if (typeof max !== 'number' || !Number.isFinite(max)) {
        fail(where, 'NAT answer.max must be a finite number');
      }
      if (typeof min === 'number' && typeof max === 'number' && min > max) {
        fail(where, 'NAT answer.min must be less than or equal to answer.max');
      }
    }
    if (question.unit !== undefined && !isText(question.unit)) {
      fail(where, 'NAT unit must be a non-empty string when present');
    }
  }

  stats.total += 1;
  stats.marks[question.marks === 1 ? 1 : 2] += 1;
  if (TYPES.has(question.type)) stats.types[question.type] += 1;
}

function validateBank(bank, index, seenIds, seenTexts) {
  const path = join(QUESTIONS_DIR, bank.questions);
  const file = readJson(path);
  const where = bank.questions;

  if (!file) return null;

  if (!isObject(file)) {
    fail(where, 'top level must be an object');
    return null;
  }
  if (file.branch !== bank.branch) {
    fail(where, `branch is "${file.branch}", expected "${bank.branch}"`);
  }
  if (!isText(file.version)) fail(where, 'version is required');
  if (!Array.isArray(file.questions) || file.questions.length === 0) {
    fail(where, 'questions must be a non-empty array');
    return null;
  }

  const stats = { total: 0, marks: { 1: 0, 2: 0 }, types: { MCQ: 0, MSQ: 0, NAT: 0 } };
  for (const question of file.questions) {
    validateQuestion(question, bank, index, stats, seenIds, seenTexts);
  }

  return stats;
}

// ---------------------------------------------------------------------------

const requested = process.argv
  .slice(2)
  .map((arg) => arg.replace(/^--/, '').toLowerCase())
  .filter((arg) => arg !== 'all');

const selected =
  requested.length === 0 ? BANKS : BANKS.filter((bank) => requested.includes(bank.key));

const unknown = requested.filter((key) => !BANKS.some((bank) => bank.key === key));
for (const key of unknown) fail('arguments', `unknown bank "${key}" (use ${BANKS.map((b) => b.key).join(', ')})`);

if (selected.length === 0) {
  console.error('No banks selected.');
  process.exit(1);
}

console.log('Syllabus');
const indexes = new Map();
for (const bank of BANKS) {
  indexes.set(bank.branch, validateSyllabus(bank));
}

console.log('\nQuestion banks');
const seenIds = new Map();
const seenTexts = new Map();
let grandTotal = 0;
let grandMarks = 0;

for (const bank of selected) {
  const stats = validateBank(bank, indexes.get(bank.branch) ?? new Map(), seenIds, seenTexts);
  if (!stats) continue;
  const marks = stats.marks[1] + stats.marks[2] * 2;
  grandTotal += stats.total;
  grandMarks += marks;
  console.log(
    `  ${bank.key.padEnd(3)} ${String(stats.total).padStart(3)} questions  ` +
      `1-mark ${String(stats.marks[1]).padStart(3)} / 2-mark ${String(stats.marks[2]).padStart(3)}  ` +
      `MCQ ${String(stats.types.MCQ).padStart(3)} / MSQ ${String(stats.types.MSQ).padStart(2)} / NAT ${String(stats.types.NAT).padStart(3)}  ` +
      `${String(marks).padStart(3)} marks`,
  );
}

if (selected.length > 1) {
  console.log(`  total ${grandTotal} questions, ${grandMarks} marks`);
}

if (warnings.length > 0) {
  console.log(`\n${warnings.length} warning(s)`);
  for (const warning of warnings) console.log(`  ! ${warning}`);
}

if (errorCount > 0) {
  console.log(`\n${errorCount} error(s)`);
  for (const error of errors) console.log(`  x ${error}`);
  process.exit(1);
}

console.log('\nAll checks passed.');
