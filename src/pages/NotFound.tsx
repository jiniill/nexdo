import { Home } from 'lucide-react';
import { LinkButton } from '../components/ui';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
        <p className="text-lg text-slate-600 mb-6">Page not found</p>
        <LinkButton
          to="/"
          variant="primary"
          size="lg"
          className="rounded-lg"
          icon={<Home className="w-4 h-4" />}
        >
          Go back home
        </LinkButton>
      </div>
    </div>
  );
}
