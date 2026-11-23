'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PRIORITY_LABELS, SORT_OPTIONS, STATUS_LABELS } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { TASK_PRIORITIES, TASK_STATUSES, type Priority, type TaskListParams, type TaskStatus } from '@/types/task';

interface TaskFiltersProps {
  params: TaskListParams;
  onChange: (patch: Partial<TaskListParams>) => void;
}

export function TaskFilters({ params, onChange }: TaskFiltersProps) {
  const [text, setText] = useState(params.search ?? '');
  const debounced = useDebounce(text.trim(), 400);

  // Push the debounced search to the URL (and the API) only after the user pauses typing.
  useEffect(() => {
    if (debounced !== (params.search ?? '')) onChange({ search: debounced || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const hasFilters = Boolean(text || params.status || params.priority);

  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
      <div className="relative sm:col-span-2 lg:col-span-1">
        <label htmlFor="task-search" className="sr-only">Search tasks by title</label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          id="task-search"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search by title"
          maxLength={100}
          className="input pl-9"
        />
      </div>

      <div>
        <label htmlFor="filter-status" className="sr-only">Filter by status</label>
        <select id="filter-status" className="input" value={params.status ?? ''} onChange={(e) => onChange({ status: (e.target.value || undefined) as TaskStatus | undefined })}>
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="filter-priority" className="sr-only">Filter by priority</label>
        <select id="filter-priority" className="input" value={params.priority ?? ''} onChange={(e) => onChange({ priority: (e.target.value || undefined) as Priority | undefined })}>
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="sort" className="sr-only">Sort tasks</label>
        <select
          id="sort"
          className="input"
          value={`${params.sortBy}:${params.order}`}
          onChange={(e) => {
            const option = SORT_OPTIONS.find((o) => o.value === e.target.value);
            if (option) onChange({ sortBy: option.sortBy, order: option.order });
          }}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <Button
        variant="ghost"
        disabled={!hasFilters}
        onClick={() => {
          setText('');
          onChange({ search: undefined, status: undefined, priority: undefined });
        }}
      >
        <X className="h-4 w-4" aria-hidden />
        Clear
      </Button>
    </div>
  );
}
