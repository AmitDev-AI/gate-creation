import { ButtonLink } from '../../components/Button';

export function NotFoundPage() {
  return (
    <div className="container-page max-w-xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">This page does not exist</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        The link may be out of date. Nothing was lost — your saved progress is unaffected.
      </p>
      <div className="mt-6">
        <ButtonLink to="/">Back to home</ButtonLink>
      </div>
    </div>
  );
}
