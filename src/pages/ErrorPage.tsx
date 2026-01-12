import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();

  let title = 'Unexpected error';
  let description = 'Something went wrong.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    description =
      typeof error.data === 'string'
        ? error.data
        : error.data?.message || description;
  } else if (error instanceof Error) {
    description = error.message;
  } else if (typeof error === 'string') {
    description = error;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600 break-words">{description}</p>

        {import.meta.env.DEV && error instanceof Error && error.stack && (
          <pre className="mt-4 text-left text-[11px] whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-slate-700">
            {error.stack}
          </pre>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Reload
          </button>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

