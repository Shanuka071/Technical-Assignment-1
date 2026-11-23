import { PAGE_SIZE } from '@/lib/constants';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Priority,
  type TaskListParams,
  type TaskStatus,
} from '@/types/task';

type SearchParamsLike = { get(name: string): string | null };

/** Reads and sanitises list state from the URL so filters survive refresh and sharing. */
export function parseListParams(sp: SearchParamsLike): TaskListParams {
  const page = Number.parseInt(sp.get('page') ?? '1', 10);
  const status = sp.get('status') as TaskStatus | null;
  const priority = sp.get('priority') as Priority | null;

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: PAGE_SIZE,
    search: sp.get('search')?.trim() || undefined,
    status: status && TASK_STATUSES.includes(status) ? status : undefined,
    priority: priority && TASK_PRIORITIES.includes(priority) ? priority : undefined,
    sortBy: sp.get('sortBy') === 'dueDate' ? 'dueDate' : 'createdAt',
    order: sp.get('order') === 'asc' ? 'asc' : 'desc',
  };
}

export function toQueryString(params: TaskListParams): string {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.status) sp.set('status', params.status);
  if (params.priority) sp.set('priority', params.priority);
  if (params.sortBy !== 'createdAt') sp.set('sortBy', params.sortBy);
  if (params.order !== 'desc') sp.set('order', params.order);
  if (params.page > 1) sp.set('page', String(params.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}
