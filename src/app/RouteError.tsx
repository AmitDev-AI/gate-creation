import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ButtonLink } from '../components/Button';

export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';

  return (
    <div className="container-page py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-rose-600 dark:text-rose-400">
        Something broke
      </p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">This screen could not be rendered</h1>
      <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300">
        Your saved progress is stored separately and is not affected by this error. Reload the page;
        if it keeps happening, export your data from Settings and report the message below.
      </p>
      <pre className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 dark:border-white/10 dark:bg-ink-900 dark:text-slate-200">
        {message}
      </pre>
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink to="/" variant="primary">
          Go to home
        </ButtonLink>
        <Link
          to="/settings"
          className="inline-flex h-11 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 hover:bg-slate-200/70 dark:text-slate-200 dark:hover:bg-white/10"
        >
          Open settings
        </Link>
      </div>
    </div>
  );
}
