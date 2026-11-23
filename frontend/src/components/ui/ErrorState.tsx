import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorState({ title = 'Could not load data', message, onRetry, action }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-4 py-16 text-center">
      <AlertTriangle className="h-10 w-10 text-red-400" aria-hidden />
      <h2 className="mt-3 text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
      <div className="mt-4 flex gap-2">
        {onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
        {action}
      </div>
    </div>
  );
}
