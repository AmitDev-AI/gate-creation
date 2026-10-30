import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../app/ProfileProvider';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { StorageWarning } from '../../components/StorageWarning';
import { ArrowRightIcon, CheckIcon } from '../../components/icons';
import { BRANCHES, getBranchSummary } from '../../data/catalog';
import type { BranchCode } from '../../domain/types';

export function SetupPage() {
  const { branch, chooseBranch, status } = useProfile();
  const [selected, setSelected] = useState<BranchCode | null>(branch);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (branch) setSelected(branch);
  }, [branch]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    await chooseBranch(selected);
    setSaving(false);
    navigate('/subjects');
  };

  return (
    <div className="container-page max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          {branch ? 'Change branch' : 'Step 1 of 1'}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Choose your branch</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          Your branch sets the core syllabus and question bank. General Aptitude is shared by every
          branch, so it is always included.
        </p>
      </div>

      <StorageWarning />

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
        <fieldset disabled={status === 'loading' || saving}>
          <legend className="sr-only">GATE paper</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {BRANCHES.map((info) => {
              const summary = getBranchSummary(info.code);
              const subjects = summary.core.subjects + summary.aptitude.subjects;
              const topics = summary.core.topics + summary.aptitude.topics;
              const isSelected = selected === info.code;

              return (
                <label
                  key={info.code}
                  className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-amber-400 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-amber-500 has-[:focus-visible]:ring-offset-2 has-checked:border-amber-500 has-checked:bg-amber-50 dark:border-white/10 dark:bg-ink-900 dark:hover:border-amber-500/50 dark:has-[:focus-visible]:ring-offset-ink-950 dark:has-checked:border-amber-500/70 dark:has-checked:bg-amber-500/10"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="branch"
                        value={info.code}
                        checked={isSelected}
                        onChange={() => setSelected(info.code)}
                        className="size-4 accent-amber-500"
                      />
                      <span className="text-lg font-bold tracking-tight">{info.code}</span>
                    </span>
                    {isSelected && (
                      <Badge tone="warning">
                        <CheckIcon /> Selected
                      </Badge>
                    )}
                  </span>
                  <span className="text-sm font-semibold">{info.name}</span>
                  <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {info.tagline}
                  </span>
                  <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {summary.questions} questions · {subjects} subjects · {topics} topics
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={!selected || saving || status === 'loading'}>
            {saving ? 'Saving…' : 'Continue to subjects'}
            <ArrowRightIcon />
          </Button>
          {branch && (
            <Button type="button" variant="ghost" size="lg" onClick={() => navigate('/')}>
              Cancel
            </Button>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No account is created. The choice is saved in this browser and can be changed at any time.
        </p>
      </form>
    </div>
  );
}
