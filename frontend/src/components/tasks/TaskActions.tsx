import { Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Task } from '@/types/task';

const iconBtn =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100';

export function TaskActions({ task, onDelete }: { task: Task; onDelete: (task: Task) => void }) {
  return (
    <div className="flex items-center gap-1">
      <Link href={`/tasks/${task.id}`} className={iconBtn} aria-label={`View ${task.title}`}>
        <Eye className="h-4 w-4" aria-hidden />
      </Link>
      <Link href={`/tasks/${task.id}/edit`} className={iconBtn} aria-label={`Edit ${task.title}`}>
        <Pencil className="h-4 w-4" aria-hidden />
      </Link>
      <button type="button" onClick={() => onDelete(task)} className={`${iconBtn} hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-500/10`} aria-label={`Delete ${task.title}`}>
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
