import { Link } from 'react-router-dom';
import { useProfile } from '../../app/ProfileProvider';
import { Badge } from '../../components/Badge';
import { ButtonLink } from '../../components/Button';
import { Card } from '../../components/Card';
import { CoverageBar } from '../../components/CoverageBar';
import { StorageWarning } from '../../components/StorageWarning';
import { ArrowRightIcon, BookIcon } from '../../components/icons';
import {
  getBranchInfo,
  getBranchSummary,
  getSubjectStats,
  type SubjectStat,
} from '../../data/catalog';
import { pluralize } from '../../lib/format';

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-xl font-bold tracking-tight">{value}</dd>
      {hint && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

function SubjectCard({ stat }: { stat: SubjectStat }) {
  return (
    <li>
      <Link
        to={`/subjects/${stat.id}`}
        className="group flex h-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-amber-400 hover:bg-amber-50/40 dark:border-white/10 dark:bg-ink-900 dark:hover:border-amber-500/50 dark:hover:bg-white/5"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold leading-snug">{stat.name}</h3>
          <Badge tone="neutral" className="shrink-0">
            {stat.weightage}%
          </Badge>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          {stat.questions} {pluralize(stat.questions, 'question')} · {stat.marks}{' '}
          {pluralize(stat.marks, 'mark')}
        </p>
        <CoverageBar
          value={stat.coveredTopics}
          max={stat.totalTopics}
          label={`${stat.coveredTopics} of ${stat.totalTopics} topics have sample questions`}
          className="mt-1"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {stat.coveredTopics} of {stat.totalTopics} {pluralize(stat.totalTopics, 'topic')} covered
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-semibold text-amber-700 group-hover:underline dark:text-amber-400">
          View topics <ArrowRightIcon />
        </span>
      </Link>
    </li>
  );
}

export function SubjectsPage() {
  const { branch, status } = useProfile();

  if (status === 'loading') {
    return (
      <div className="container-page max-w-2xl">
        <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
          Loading your subjects…
        </p>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="container-page max-w-2xl">
        <Card className="space-y-4">
          <BookIcon className="text-2xl text-amber-600 dark:text-amber-400" />
          <h1 className="text-2xl font-bold tracking-tight">Pick a branch first</h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            The subject list and question counts depend on which GATE paper you are preparing for.
            It takes one tap and can be changed later.
          </p>
          <ButtonLink to="/setup">
            Choose your branch <ArrowRightIcon />
          </ButtonLink>
        </Card>
      </div>
    );
  }

  const info = getBranchInfo(branch);
  const summary = getBranchSummary(branch);
  const core = getSubjectStats(branch);
  const aptitude = getSubjectStats('GA');

  return (
    <div className="container-page space-y-8">
      <StorageWarning />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            {info.code} · {info.name}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Subjects</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Every subject below is part of your core paper. Percentages are the syllabus weightage;
            question counts are live from the bundled bank.
          </p>
        </div>
        <ButtonLink to="/setup" variant="secondary" size="sm">
          Change branch
        </ButtonLink>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Questions" value={String(summary.questions)} hint="core + aptitude" />
        <Stat label="Marks" value={String(summary.marks)} hint="at 1 and 2 marks" />
        <Stat
          label="Core topics"
          value={`${summary.core.coveredTopics}/${summary.core.topics}`}
          hint="with sample questions"
        />
        <Stat
          label="Aptitude"
          value={String(summary.aptitude.questions)}
          hint="shared questions"
        />
      </dl>

      <section aria-labelledby="core-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="core-heading" className="text-lg font-semibold tracking-tight">
              Core subjects
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {core.length} {pluralize(core.length, 'subject')}, {summary.core.topics}{' '}
              {pluralize(summary.core.topics, 'topic')}.
            </p>
          </div>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {core.map((stat) => (
            <SubjectCard key={stat.id} stat={stat} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="aptitude-heading">
        <h2 id="aptitude-heading" className="text-lg font-semibold tracking-tight">
          General Aptitude
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Common to every branch and worth 15 marks in the real paper.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {aptitude.map((stat) => (
            <SubjectCard key={stat.id} stat={stat} />
          ))}
        </ul>
      </section>

      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        A topic with no questions yet is shown as 0 instead of being hidden, so the gaps in the
        sample bank stay visible.
      </p>
    </div>
  );
}
