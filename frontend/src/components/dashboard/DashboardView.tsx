'use client';

import { Activity, AlertTriangle, CheckCircle2, Clock, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { PriorityBadge, StatusBadge } from '@/components/tasks/Badges';
import { DueDate } from '@/components/tasks/DueDate';
import { buttonClass } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageLoader } from '@/components/ui/Spinner';
import { useDashboardStats, useTasks } from '@/hooks/useTasks';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { DistributionCard } from './DistributionCard';
import { StatCard } from './StatCard';

const RECENT = { page: 1, limit: 5, sortBy: 'createdAt', order: 'desc' } as const;

export function DashboardView() {
  const stats = useDashboardStats();
  const recent = useTasks(RECENT);

  if (stats.isLoading) return <PageLoader label="Loading dashboard" />;
  if (stats.isError) return <ErrorState message={getErrorMessage(stats.error)} onRetry={() => stats.refetch()} />;

  const s = stats.data!;
  if (s.total === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task and the dashboard will show how your work is going."
        action={<Link href="/tasks/new" className={buttonClass()}>Create a task</Link>}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {s.completionRate}% of your tasks are complete.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total tasks" value={s.total} icon={ListChecks} />
        <StatCard label="Completed" value={s.completed} icon={CheckCircle2} />
        <StatCard label="In progress" value={s.inProgress} icon={Activity} />
        <StatCard label="Pending" value={s.pending} icon={Clock} hint="Not started" />
        <StatCard label="Overdue" value={s.overdue} icon={AlertTriangle} tone="danger" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DistributionCard
          title="Tasks by status"
          rows={[
            { label: STATUS_LABELS.TODO, value: s.byStatus.TODO, barClass: 'bg-slate-400' },
            { label: STATUS_LABELS.IN_PROGRESS, value: s.byStatus.IN_PROGRESS, barClass: 'bg-blue-500' },
            { label: STATUS_LABELS.COMPLETED, value: s.byStatus.COMPLETED, barClass: 'bg-emerald-500' },
          ]}
        />
        <DistributionCard
          title="Tasks by priority"
          rows={[
            { label: PRIORITY_LABELS.HIGH, value: s.byPriority.HIGH, barClass: 'bg-red-500' },
            { label: PRIORITY_LABELS.MEDIUM, value: s.byPriority.MEDIUM, barClass: 'bg-amber-500' },
            { label: PRIORITY_LABELS.LOW, value: s.byPriority.LOW, barClass: 'bg-slate-400' },
          ]}
        />
      </div>

      <section className="card" aria-labelledby="recent-heading">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 id="recent-heading" className="text-base font-semibold">Recently added</h2>
          <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">View all tasks</Link>
        </div>
        {recent.isLoading && <PageLoader />}
        {recent.isError && <ErrorState message={getErrorMessage(recent.error)} onRetry={() => recent.refetch()} />}
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {recent.data?.items.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <Link href={`/tasks/${t.id}`} className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400">{t.title}</Link>
              <div className="flex flex-wrap items-center gap-3">
                <DueDate task={t} />
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
