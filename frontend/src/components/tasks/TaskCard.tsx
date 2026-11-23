import Link from 'next/link';
import type { DragEvent } from 'react';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types/task';
import { PriorityBadge, StatusBadge } from './Badges';
import { DueDate } from './DueDate';
import { StatusSelect } from './StatusSelect';
import { TaskActions } from './TaskActions';

interface TaskCardProps {
  task: Task;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onDelete?: (task: Task) => void;
  draggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLElement>, task: Task) => void;
  showStatusBadge?: boolean;
}

/** Used for the mobile task list and for the Kanban board. */
export function TaskCard({ task, onStatusChange, onDelete, draggable, onDragStart, showStatusBadge }: TaskCardProps) {
  return (
    <article
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, task)}
      className={cn('card space-y-3 p-4', draggable && 'cursor-grab active:cursor-grabbing')}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/tasks/${task.id}`} className="font-medium leading-snug hover:text-indigo-600 dark:hover:text-indigo-400">
          {task.title}
        </Link>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.description && <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{task.description}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <DueDate task={task} />
        {showStatusBadge && <StatusBadge status={task.status} />}
      </div>
      <div className="flex items-center justify-between gap-2">
        <StatusSelect value={task.status} taskTitle={task.title} onChange={(s) => onStatusChange(task, s)} className="text-xs" />
        {onDelete && <TaskActions task={task} onDelete={onDelete} />}
      </div>
    </article>
  );
}
