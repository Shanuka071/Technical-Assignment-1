import { STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { TASK_STATUSES, type TaskStatus } from '@/types/task';

interface StatusSelectProps {
  value: TaskStatus;
  taskTitle: string;
  onChange: (status: TaskStatus) => void;
  className?: string;
}

/** Native select: keyboard accessible and works on touch devices. */
export function StatusSelect({ value, taskTitle, onChange, className }: StatusSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      aria-label={`Status for ${taskTitle}`}
      className={cn('input w-auto py-1.5 pr-8', className)}
    >
      {TASK_STATUSES.map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
