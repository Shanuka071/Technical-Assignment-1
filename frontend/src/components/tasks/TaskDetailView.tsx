'use client';

import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, buttonClass } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { useDeleteTask, useTask, useUpdateTaskStatus } from '@/hooks/useTasks';
import { getErrorMessage } from '@/lib/errors';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ApiError } from '@/services/apiClient';
import { PriorityBadge } from './Badges';
import { DueDate } from './DueDate';
import { StatusSelect } from './StatusSelect';

export function TaskDetailView({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: task, isLoading, isError, error, refetch } = useTask(id);
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const [confirming, setConfirming] = useState(false);

  if (isLoading) return <PageLoader label="Loading task" />;

  if (isError || !task) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 422);
    return (
      <ErrorState
        title={notFound ? 'Task not found' : 'Could not load task'}
        message={notFound ? 'It may have been deleted, or the link is incorrect.' : getErrorMessage(error)}
        onRetry={notFound ? undefined : () => refetch()}
        action={<Link href="/tasks" className={buttonClass('secondary')}>Back to tasks</Link>}
      />
    );
  }

  const handleDelete = () =>
    deleteTask.mutate(id, {
      onSuccess: () => {
        toast.success('Task deleted');
        router.replace('/tasks');
      },
      onError: (e) => {
        toast.error(getErrorMessage(e));
        setConfirming(false);
      },
    });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/tasks" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to tasks
      </Link>

      <article className="card divide-y divide-slate-200 dark:divide-slate-800">
        <header className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold leading-tight">{task.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <PriorityBadge priority={task.priority} />
              <DueDate task={task} />
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/tasks/${task.id}/edit`} className={buttonClass('secondary')}>
              <Pencil className="h-4 w-4" aria-hidden />
              Edit
            </Link>
            <Button variant="danger" onClick={() => setConfirming(true)}>
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete
            </Button>
          </div>
        </header>

        <section className="p-6" aria-labelledby="desc-heading">
          <h2 id="desc-heading" className="text-sm font-medium text-slate-500 dark:text-slate-400">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {task.description || <span className="text-slate-400">No description provided.</span>}
          </p>
        </section>

        <dl className="grid gap-6 p-6 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Status</dt>
            <dd className="mt-1.5">
              <StatusSelect
                value={task.status}
                taskTitle={task.title}
                onChange={(status) => updateStatus.mutate({ id, status }, { onError: (e) => toast.error(getErrorMessage(e)) })}
              />
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Due date</dt>
            <dd className="mt-1.5 font-medium">{formatDate(task.dueDate)}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Created</dt>
            <dd className="mt-1.5">{formatDateTime(task.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Last updated</dt>
            <dd className="mt-1.5">{formatDateTime(task.updatedAt)}</dd>
          </div>
        </dl>
      </article>

      <ConfirmDialog
        open={confirming}
        title="Delete this task?"
        message={`"${task.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete task"
        loading={deleteTask.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
