import { useState } from 'react';
import { Badge } from '../../components/Badge';
import { Button, ButtonLink } from '../../components/Button';
import { Card, CardTitle } from '../../components/Card';
import {
  AlertIcon,
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

export function HomePage() {
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
    <div className="container-page space-y-10">
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
          {installed ? (
            <Badge tone="success" className="h-9 px-3 text-sm">
              <CheckIcon /> Installed on this device
            </Badge>
          ) : canInstall ? (
            <Button size="lg" onClick={() => void handleInstall()}>
              <DownloadIcon /> Install the app
            </Button>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              To install: Chrome/Edge menu → <strong>Install app</strong>. On iPhone: Share →{' '}
              <strong>Add to Home Screen</strong>.
            </p>
          )}
          <ButtonLink to="/settings" variant="secondary" size="lg">
            Settings
          </ButtonLink>
        </div>

        {installNote && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300" role="status">
            {installNote}
          </p>
        )}
      </section>

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

      <section aria-labelledby="device-heading" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 id="device-heading" className="text-base font-semibold">
            This device
          </h2>
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
          {!loading && !storageOk && (
            <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-500/10 dark:text-rose-300">
              This browser is blocking IndexedDB (often private mode). Progress cannot be saved
              here — open the app in a normal window.
            </p>
          )}
        </Card>

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
      </section>
    </div>
  );
}
