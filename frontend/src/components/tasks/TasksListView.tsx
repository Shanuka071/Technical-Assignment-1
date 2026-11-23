'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { buttonClass } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { useDeleteTask, useTasks, useUpdateTaskStatus } from '@/hooks/useTasks';
import { getErrorMessage } from '@/lib/errors';
import { parseListParams, toQueryString } from '@/lib/listParams';
import type { Task, TaskListParams, TaskStatus } from '@/types/task';
import { TaskFilters } from './TaskFilters';
import { TaskTable } from './TaskTable';

export function TasksListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();

  // The URL is the source of truth for filters, sorting and page: refresh/share/back all work.
  const params = useMemo(() => parseListParams(searchParams), [searchParams]);
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useTasks(params);
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const setParams = useCallback(
    (patch: Partial<TaskListParams>) => {
      // Any filter/sort change returns to page 1 unless a page is given explicitly.
      router.replace(`${pathname}${toQueryString({ ...params, page: 1, ...patch })}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const handleStatusChange = (task: Task, status: TaskStatus) => {
    if (status === task.status) return;
    updateStatus.mutate({ id: task.id, status }, { onError: (e) => toast.error(getErrorMessage(e)) });
  };

  const confirmDelete = () => {
    if (!taskToDelete) return;
    deleteTask.mutate(taskToDelete.id, {
      onSuccess: () => {
        toast.success('Task deleted');
        // Deleting the last row of a later page would leave an empty page: step back.
        if (data && data.items.length === 1 && params.page > 1) setParams({ page: params.page - 1 });
        setTaskToDelete(null);
      },
      onError: (e) => {
        toast.error(getErrorMessage(e));
        setTaskToDelete(null);
      },
    });
  };

  const isFiltered = Boolean(params.search || params.status || params.priority);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search, filter and manage everything in one place.</p>
        </div>
        <Link href="/tasks/new" className={buttonClass()}>
          <Plus className="h-4 w-4" aria-hidden />
          New task
        </Link>
      </div>

      <section className="card overflow-hidden" aria-label="Task list">
        <TaskFilters params={params} onChange={setParams} />
        <div className="border-t border-slate-200 dark:border-slate-800">
          {isLoading && <PageLoader label="Loading tasks" />}
          {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />}
          {data && data.items.length === 0 && (
            <EmptyState
              title={isFiltered ? 'No tasks match your filters' : 'No tasks yet'}
              description={isFiltered ? 'Try a different search or clear the filters.' : 'Create a task to get started.'}
              action={!isFiltered && <Link href="/tasks/new" className={buttonClass()}>Create a task</Link>}
            />
          )}
          {data && data.items.length > 0 && (
            <>
              <TaskTable
                tasks={data.items}
                sortBy={params.sortBy}
                stale={isPlaceholderData}
                onStatusChange={handleStatusChange}
                onDelete={setTaskToDelete}
              />
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                total={data.meta.total}
                limit={data.meta.limit}
                onPageChange={(page) => setParams({ page })}
              />
            </>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={taskToDelete !== null}
        title="Delete this task?"
        message={`"${taskToDelete?.title ?? ''}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete task"
        loading={deleteTask.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
