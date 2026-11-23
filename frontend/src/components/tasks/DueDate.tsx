import { CalendarDays } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import type { Task } from '@/types/task';

export function DueDate({ task }: { task: Pick<Task, 'dueDate' | 'isOverdue'> }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', task.isOverdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300')}>
      <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
      {formatDate(task.dueDate)}
      {task.isOverdue && <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs dark:bg-red-500/10">Overdue</span>}
    </span>
  );
}
