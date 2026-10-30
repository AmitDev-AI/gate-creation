import { useState } from 'react';
import { useProfile } from '../../app/ProfileProvider';
import { Badge } from '../../components/Badge';
import { Button, ButtonLink } from '../../components/Button';
import { Card, CardTitle } from '../../components/Card';
import { StorageWarning } from '../../components/StorageWarning';
import {
  AlertIcon,
  ArrowRightIcon,
  BookIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  DeviceIcon,
  DownloadIcon,
  RefreshIcon,
  TargetIcon,
} from '../../components/icons';
import { ROADMAP } from '../../app/roadmap';
import { getBranchInfo, getBranchSummary, countQuestionTypes } from '../../data/catalog';
import type { BranchCode } from '../../domain/types';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { useStorageReport } from '../../hooks/useStorageReport';
import { formatBytes } from '../../lib/format';
import { cn } from '../../lib/cn';

const PROBLEMS = [
  {
    icon: TargetIcon,
    title: '“I don’t know what I’m weak at.”',
    body: 'Every session ends with three concrete next actions, each a one-tap drill on the topic you actually got wrong — with the reason shown.',
  },
  {
    icon: BookIcon,
    title: '“I can’t afford a test series.”',
    body: 'Full 65-question mocks with GATE marking, free forever. No account, no subscription, no paywall on results.',
  },
  {
    icon: DeviceIcon,
    title: '“My internet dies mid-test.”',
    body: 'The app and its question bank are cached on your device. A test started offline finishes offline; every answer is saved as you click.',
  },
  {
    icon: ClockIcon,
    title: '“I study but my marks don’t move.”',
    body: 'Time per question separates a knowledge gap from a speed problem, so you fix the right thing instead of revising everything.',
  },
  {
    icon: CalendarIcon,
    title: '“I don’t know what to do today.”',
    body: 'Due revisions first, then your weakest topic, then the next planner slot. One action on the home screen, not a menu of options.',
  },
  {
    icon: RefreshIcon,
    title: '“I lose progress when I change phones.”',
    body: 'Export everything to a single JSON file and import it on another device. Your data never leaves your control.',
  },
];

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-xl font-bold tracking-tight">{value}</dd>
      {hint && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

function FirstRun() {
  return (
    <section className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="warning">Development preview</Badge>
        <Badge tone="neutral">Free · No account</Badge>
        <Badge tone="info">Works offline</Badge>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        GATE preparation that tells you what to fix next.
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
        Built for students on slow connections and low-end phones: practice by topic, full mock
        tests with real GATE marking, weak-topic analysis and a study plan that adapts to your
        mistakes — all stored on your device.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ButtonLink to="/setup" size="lg">
          Choose your branch <ArrowRightIcon />
        </ButtonLink>
        <ButtonLink to="/settings" variant="secondary" size="lg">
          Settings
        </ButtonLink>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        One tap to start. No account, no email, no test series to buy.
      </p>
    </section>
  );
}

function TodayPanel({ branch }: { branch: BranchCode }) {
  const info = getBranchInfo(branch);
  const summary = getBranchSummary(branch);
  const types = countQuestionTypes(branch);

  return (
    <section className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="success">
          <CheckIcon /> Set up for {branch}
        </Badge>
        <Badge tone="neutral">Free · No account</Badge>
        <Badge tone="info">Works offline</Badge>
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Your {branch} prep, at a glance.
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
        {info.name}. The bundled bank already holds {summary.questions} original questions worth{' '}
        {summary.marks} marks across {summary.core.subjects} core subjects and shared General
        Aptitude. Start with the syllabus, then practise topic by topic.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ButtonLink to="/subjects" size="lg">
          Browse subjects <ArrowRightIcon />
        </ButtonLink>
        <ButtonLink to="/setup" variant="secondary" size="lg">
          Change branch
        </ButtonLink>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Questions" value={String(summary.questions)} hint="core + aptitude" />
        <Stat label="Marks" value={String(summary.marks)} hint="at 1 and 2 marks" />
        <Stat
          label="Core topics"
          value={`${summary.core.coveredTopics}/${summary.core.topics}`}
          hint="with sample questions"
        />
        <Stat
          label="MCQ / MSQ / NAT"
          value={`${types.MCQ} / ${types.MSQ} / ${types.NAT}`}
          hint={`${summary.aptitude.questions} shared aptitude`}
        />
      </dl>
    </section>
  );
}

function ProblemsSection() {
  return (
    <section aria-labelledby="problems-heading">
      <h2 id="problems-heading" className="text-xl font-semibold tracking-tight">
        The problem, and what this app does about it
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROBLEMS.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="flex flex-col gap-2">
            <Icon className="text-xl text-amber-600 dark:text-amber-400" />
            <CardTitle as="h3">{title}</CardTitle>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function DeviceCard() {
  const { canInstall, installed, install } = useInstallPrompt();
  const { report, loading } = useStorageReport();
  const [installNote, setInstallNote] = useState<string | null>(null);

  const handleInstall = async () => {
    const accepted = await install();
    setInstallNote(
      accepted
        ? 'Installed. Open GATE Prep Hub from your home screen or Start menu.'
        : 'Install cancelled. You can install any time from the browser menu.',
    );
  };

  const storageOk = report?.indexedDb === true;

  return (
    <Card>
      <h2 className="text-base font-semibold">This device</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-600 dark:text-slate-300">Offline storage</dt>
          <dd>
            {loading ? (
              <span className="text-slate-500 dark:text-slate-400">Checking…</span>
            ) : storageOk ? (
              <Badge tone="success">
                <CheckIcon /> Available
              </Badge>
            ) : (
              <Badge tone="danger">
                <AlertIcon /> Blocked
              </Badge>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-600 dark:text-slate-300">Space used</dt>
          <dd className="font-medium">
            {loading
              ? '—'
              : `${formatBytes(report?.usageBytes ?? null)} of ${formatBytes(report?.quotaBytes ?? null)}`}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-600 dark:text-slate-300">Install state</dt>
          <dd className="font-medium">
            {installed ? 'Installed' : canInstall ? 'Ready to install' : 'In browser'}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        {installed ? (
          <Badge tone="success">
            <CheckIcon /> Installed on this device
          </Badge>
        ) : canInstall ? (
          <Button size="sm" onClick={() => void handleInstall()}>
            <DownloadIcon /> Install the app
          </Button>
        ) : (
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            To install: Chrome/Edge menu → <strong>Install app</strong>. On iPhone: Share →{' '}
            <strong>Add to Home Screen</strong>.
          </p>
        )}
      </div>

      {installNote && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300" role="status">
          {installNote}
        </p>
      )}

      {!loading && !storageOk && (
        <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-500/10 dark:text-rose-300">
          This browser is blocking IndexedDB (often private mode). Progress cannot be saved here —
          open the app in a normal window.
        </p>
      )}
    </Card>
  );
}

function RoadmapCard() {
  return (
    <Card>
      <h2 className="text-base font-semibold">Build status</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Updated after every step. This panel is removed before release.
      </p>
      <ol className="mt-3 space-y-1.5">
        {ROADMAP.map((step) => (
          <li key={step.n} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                'grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold',
                step.status === 'done' &&
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
                step.status === 'next' &&
                  'bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300',
                step.status === 'planned' &&
                  'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400',
              )}
              aria-hidden="true"
            >
              {step.status === 'done' ? <CheckIcon className="text-xs" /> : step.n}
            </span>
            <span
              className={cn(
                step.status === 'planned'
                  ? 'text-slate-500 dark:text-slate-400'
                  : 'text-slate-800 dark:text-slate-200',
              )}
            >
              {step.title}
            </span>
            <span className="sr-only">
              {step.status === 'done' ? 'completed' : step.status === 'next' ? 'next' : 'planned'}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function HomePage() {
  const { branch, status } = useProfile();

  return (
    <div className="container-page space-y-10">
      <StorageWarning />

      {status === 'loading' ? (
        <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
          Loading your setup…
        </p>
      ) : branch ? (
        <TodayPanel branch={branch} />
      ) : (
        <FirstRun />
      )}

      {!branch && <ProblemsSection />}

      <section className="grid gap-4 lg:grid-cols-2">
        <DeviceCard />
        <RoadmapCard />
      </section>
    </div>
  );
}
