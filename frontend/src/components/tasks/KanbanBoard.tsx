'use client';

import { type DragEvent, useMemo, useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { useTasks, useUpdateTaskStatus } from '@/hooks/useTasks';
import { STATUS_LABELS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { TASK_STATUSES, type Task, type TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';

const BOARD_PARAMS = { page: 1, limit: 100, sortBy: 'dueDate', order: 'asc' } as const;

const columnAccent: Record<TaskStatus, string> = {
  TODO: 'bg-slate-400',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-emerald-500',
};

export function KanbanBoard() {
  const { data, isLoading, isError, error, refetch } = useTasks(BOARD_PARAMS);
  const updateStatus = useUpdateTaskStatus();
  const toast = useToast();
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  const columns = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], COMPLETED: [] };
    data?.items.forEach((t) => grouped[t.status].push(t));
    return grouped;
  }, [data]);

  const move = (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    updateStatus.mutate({ id: task.id, status }, { onError: (e) => toast.error(getErrorMessage(e)) });
  };

  const onDragStart = (e: DragEvent<HTMLElement>, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (e: DragEvent<HTMLElement>, status: TaskStatus) => {
    e.preventDefault();
    setDragOver(null);
    const task = data?.items.find((t) => t.id === e.dataTransfer.getData('text/plain'));
    if (task) move(task, status);
  };

  if (isLoading) return <PageLoader label="Loading board" />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />;
  if (!data || data.meta.total === 0) {
    return <EmptyState title="Your board is empty" description="Create a task to see it here." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Board</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Drag a card to another column to change its status, or use the status menu on the card.
          {data.meta.total > data.items.length && ` Showing the ${data.items.length} tasks due soonest.`}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {TASK_STATUSES.map((status) => (
          <section
            key={status}
            aria-label={`${STATUS_LABELS[status]} column`}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragOver(status)}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
            }}
            onDrop={(e) => onDrop(e, status)}
            className={cn(
              'rounded-xl border-2 border-dashed p-3 transition-colors',
              dragOver === status ? 'border-indigo-400 bg-indigo-50/60 dark:bg-indigo-500/10' : 'border-transparent bg-slate-100/70 dark:bg-slate-900/60',
            )}
          >
            <header className="mb-3 flex items-center gap-2 px-1">
              <span className={cn('h-2.5 w-2.5 rounded-full', columnAccent[status])} aria-hidden />
              <h2 className="text-sm font-semibold">{STATUS_LABELS[status]}</h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {columns[status].length}
              </span>
            </header>
            <ul className="min-h-24 space-y-3">
              {columns[status].map((task) => (
                <li key={task.id}>
                  <TaskCard task={task} draggable onDragStart={onDragStart} onStatusChange={move} />
                </li>
              ))}
              {columns[status].length === 0 && (
                <li className="rounded-lg py-8 text-center text-sm text-slate-400">No tasks</li>
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
