import type { Priority, SortBy, SortOrder, TaskStatus } from '@/types/task';

export const PAGE_SIZE = 10;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const SORT_OPTIONS: { value: string; label: string; sortBy: SortBy; order: SortOrder }[] = [
  { value: 'createdAt:desc', label: 'Newest first', sortBy: 'createdAt', order: 'desc' },
  { value: 'createdAt:asc', label: 'Oldest first', sortBy: 'createdAt', order: 'asc' },
  { value: 'dueDate:asc', label: 'Due soonest', sortBy: 'dueDate', order: 'asc' },
  { value: 'dueDate:desc', label: 'Due latest', sortBy: 'dueDate', order: 'desc' },
];
