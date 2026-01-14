import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Button, LinkButton } from '../components/ui';

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
          <Button
            type="button"
            onClick={() => window.location.reload()}
            variant="neutral"
            size="lg"
            className="rounded-lg"
          >
            Reload
          </Button>
          <LinkButton
            to="/"
            variant="primary"
            size="lg"
            className="rounded-lg"
          >
            Go Home
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
