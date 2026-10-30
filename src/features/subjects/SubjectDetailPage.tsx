import { Link, useParams } from 'react-router-dom';
import { useProfile } from '../../app/ProfileProvider';
import { Badge } from '../../components/Badge';
import { ButtonLink } from '../../components/Button';
import { Card } from '../../components/Card';
import { CoverageBar } from '../../components/CoverageBar';
import { StorageWarning } from '../../components/StorageWarning';
import { ArrowRightIcon } from '../../components/icons';
import { findSubject } from '../../data/catalog';
import { pluralize } from '../../lib/format';

export function SubjectDetailPage() {
  const { branch, status } = useProfile();
  const { subjectId = '' } = useParams();

  if (status === 'loading') {
    return (
      <div className="container-page max-w-2xl">
        <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
          Loading subject…
        </p>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="container-page max-w-2xl">
        <Card className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Pick a branch first</h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Subjects belong to a GATE paper. Choose yours to see its topics.
          </p>
          <ButtonLink to="/setup">
            Choose your branch <ArrowRightIcon />
          </ButtonLink>
        </Card>
      </div>
    );
  }

  const view = findSubject(branch, subjectId);

  if (!view) {
    return (
      <div className="container-page max-w-2xl">
        <Card className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Subject not found</h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            “{subjectId}” is not part of the {branch} syllabus or General Aptitude.
          </p>
          <ButtonLink to="/subjects" variant="secondary">
            Back to subjects
          </ButtonLink>
        </Card>
      </div>
    );
  }

  const { subject, stat, bankBranch } = view;
  const isAptitude = bankBranch === 'GA';

  return (
    <div className="container-page max-w-3xl space-y-6">
      <StorageWarning />

      <div>
        <Link
          to="/subjects"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          ← All subjects
        </Link>
      </div>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isAptitude ? 'info' : 'neutral'}>
            {isAptitude ? 'General Aptitude' : branch}
          </Badge>
          <Badge tone="warning">{stat.weightage}% weightage</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{subject.name}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {stat.questions} {pluralize(stat.questions, 'question')} · {stat.marks}{' '}
          {pluralize(stat.marks, 'mark')} · {stat.coveredTopics} of {stat.totalTopics}{' '}
          {pluralize(stat.totalTopics, 'topic')} covered
        </p>
        <CoverageBar
          value={stat.coveredTopics}
          max={stat.totalTopics}
          label={`${stat.coveredTopics} of ${stat.totalTopics} topics have sample questions`}
          className="max-w-md"
        />
      </header>

      <section aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="text-lg font-semibold tracking-tight">
          Topics
        </h2>
        <ul className="mt-3 space-y-2">
          {stat.topics.map((topic) => (
            <li
              key={topic.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-ink-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">{topic.name}</h3>
                  {topic.subtopics.length > 0 && (
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {topic.subtopics.join(' · ')}
                    </p>
                  )}
                </div>
                {topic.questions > 0 ? (
                  <Badge tone="info">
                    {topic.questions} Q · {topic.marks} {pluralize(topic.marks, 'mark')}
                  </Badge>
                ) : (
                  <Badge tone="warning">No sample questions yet</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        Counts come from the question bank bundled with this build. Topic practice is the next
        milestone on the build roadmap.
      </p>
    </div>
  );
}
