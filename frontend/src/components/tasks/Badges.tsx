import { PRIORITY_LABELS, STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Priority, TaskStatus } from '@/types/task';

const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset';

const statusStyles: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/40',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30',
};

const priorityStyles: Record<Priority, string> = {
  LOW: 'bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/40',
  MEDIUM: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30',
  HIGH: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/30',
};

export const StatusBadge = ({ status }: { status: TaskStatus }) => (
  <span className={cn(base, statusStyles[status])}>{STATUS_LABELS[status]}</span>
);

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span className={cn(base, priorityStyles[priority])}>{PRIORITY_LABELS[priority]}</span>
);
