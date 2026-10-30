# Question format

Every question in GATE Prep Hub lives in `src/data/questions/<bank>.json`. The files are plain
JSON so they can be reviewed in a pull request, diffed, and validated without running the app.

Banks:

| File | Branch | Contents |
|---|---|---|
| `general-aptitude.json` | `GA` | General Aptitude, shared by every branch |
| `cse.json` | `CSE` | Computer Science and Information Technology |
| `ece.json` | `ECE` | Electronics and Communication Engineering |
| `ee.json` | `EE` | Electrical Engineering |
| `me.json` | `ME` | Mechanical Engineering |
| `ce.json` | `CE` | Civil Engineering |

Syllabi live in `src/data/syllabus/` and use the same file names. A question may only reference a
subject and topic that exist in its branch's syllabus.

## File shape

```json
{
  "branch": "CSE",
  "version": "2026.1",
  "questions": []
}
```

`branch` must match the file, and `version` is bumped whenever questions are added or corrected.

## Common fields

Every question has these fields:

| Field | Type | Rules |
|---|---|---|
| `id` | string | Unique across **all** banks. Lowercase letters, digits and hyphens, e.g. `cse-os-004`. |
| `branch` | string | `GA`, `CSE`, `ECE`, `EE`, `ME` or `CE`; must equal the bank's branch. |
| `subject` | string | Must be a subject id from the branch syllabus, e.g. `cse-os`. |
| `topic` | string | Must be a topic id inside that subject, e.g. `cse-os-sched`. |
| `marks` | `1` or `2` | GATE mark value. |
| `difficulty` | string | `easy`, `medium` or `hard`. |
| `source` | string | `sample` for original practice questions, `community` for contributed ones. |
| `question` | string | At least 15 characters. Supports simple text only; no HTML. |
| `explanation` | string | At least 40 characters. Must say **why** the answer is right, not just restate it. |
| `tags` | string[] | Optional. Lowercase keywords for search, e.g. `["cache", "addressing"]`. |
| `type` | string | `MCQ`, `MSQ` or `NAT`. |

## MCQ — one correct option

```json
{
  "id": "cse-os-001",
  "branch": "CSE",
  "subject": "cse-os",
  "topic": "cse-os-sched",
  "type": "MCQ",
  "marks": 1,
  "difficulty": "easy",
  "source": "sample",
  "question": "Under non-preemptive SJF, which process runs first?",
  "options": [
    { "id": "A", "text": "The one with the smallest burst time" },
    { "id": "B", "text": "The one that arrived last" },
    { "id": "C", "text": "The one with the largest burst time" },
    { "id": "D", "text": "The one with the highest priority" }
  ],
  "answer": "A",
  "explanation": "Non-preemptive SJF always picks the ready process with the smallest burst time, which minimises average waiting time.",
  "tags": ["sjf", "scheduling"]
}
```

Rules: exactly four options, ids `A`–`D` in order, unique option text, `answer` is one id.

## MSQ — one or more correct options

```json
{
  "id": "cse-os-002",
  "branch": "CSE",
  "subject": "cse-os",
  "topic": "cse-os-deadlock",
  "type": "MSQ",
  "marks": 2,
  "difficulty": "medium",
  "source": "sample",
  "question": "Which of the following are necessary conditions for a deadlock?",
  "options": [
    { "id": "A", "text": "Mutual exclusion" },
    { "id": "B", "text": "Hold and wait" },
    { "id": "C", "text": "Preemption of every resource" },
    { "id": "D", "text": "Circular wait" }
  ],
  "answer": ["A", "B", "D"],
  "explanation": "Deadlock requires mutual exclusion, hold and wait, no preemption and circular wait. Allowing preemption breaks the deadlock condition, so C is false.",
  "tags": ["deadlock"]
}
```

Rules: exactly four options, `answer` lists **all and only** the correct ids, and at least two ids.
In GATE, a partially correct MSQ earns no marks — the scoring engine follows that.

## NAT — numerical answer

```json
{
  "id": "cse-cn-001",
  "branch": "CSE",
  "subject": "cse-cn",
  "topic": "cse-cn-ip",
  "type": "NAT",
  "marks": 1,
  "difficulty": "easy",
  "source": "sample",
  "question": "How many usable host addresses does a /26 IPv4 subnet provide?",
  "answer": { "min": 62, "max": 62 },
  "unit": "hosts",
  "explanation": "A /26 leaves 6 host bits, so there are 2^6 = 64 addresses. Removing the network and broadcast addresses leaves 62 usable hosts.",
  "tags": ["subnetting", "cidr"]
}
```

Rules: no `options`; `answer.min` and `answer.max` are finite numbers with `min <= max`. Use a range
only when the question genuinely accepts one (for example a tolerance). `unit` is optional display
text such as `hosts`, `ms` or `cm`.

## Marking rules the engine applies

| Type | Correct | Wrong | Unanswered |
|---|---|---|---|
| MCQ 1 mark | +1 | −1/3 | 0 |
| MCQ 2 marks | +2 | −2/3 | 0 |
| MSQ 1 mark | +1 | 0 | 0 |
| MSQ 2 marks | +2 | 0 | 0 |
| NAT 1 mark | +1 | 0 | 0 |
| NAT 2 marks | +2 | 0 | 0 |

Only MCQs carry negative marking, and only MSQ/NAT are exempt. Marks are rounded to two decimals
at the end of a session.

## ID conventions

- Branch prefix: `ga-`, `cse-`, `ece-`, `ee-`, `me-`, `ce-`.
- Subject and topic ids are `<branch>-<short-name>` and `<subject>-<short-name>`.
- Question ids are `<branch>-<subject-short>-<number>`, numbered from `001` inside each subject.
  Numbers only need to be unique per bank; the validator enforces global uniqueness.

## Validating your changes

```powershell
node scripts/validate-questions.mjs          # every bank
node scripts/validate-questions.mjs cse      # one bank
node scripts/validate-questions.mjs ga cse   # several banks
```

`npm test` and `npm run build` run the validator automatically (`pretest` / `prebuild`), so a
malformed file fails the build instead of shipping.

The validator checks:

- JSON parses, `branch` and `version` are present and correct
- every subject weightage sums to exactly 100 per branch
- subject and topic ids are unique and prefixed correctly
- every question references an existing subject and topic
- ids are unique across all banks; question text is not duplicated
- `marks`, `difficulty`, `source` and `type` use allowed values
- MCQ/MSQ have exactly options `A`–`D`, with no duplicate option text
- MCQ answers a real option; MSQ answers at least two real options
- NAT answers are finite and ordered; NAT has no options
- explanations are at least 40 characters

## Originality policy

All sample questions are written for this project. Previous-year GATE questions are **never**
copied, paraphrased or lightly reworded. If you contribute a question, it must be original and
must have a worked explanation. Questions that turn out to be copied will be removed.

## Adding a new branch

1. Add `<branch>.json` to `src/data/syllabus/` with subjects whose weightage sums to 100.
2. Add `<branch>.json` to `src/data/questions/`.
3. Add the branch to `BANKS` in `scripts/validate-questions.mjs`.
4. Add the code to `BranchCode` in `src/domain/types.ts` and to the branch picker in step 2.
5. Run `node scripts/validate-questions.mjs <branch>`.
