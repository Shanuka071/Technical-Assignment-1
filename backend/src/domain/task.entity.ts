/**
 * Framework-independent domain types. Keeping them separate from Prisma means
 * services, mappers and tests never depend on the ORM.
 */
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'] as const;
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export const TASK_SORT_FIELDS = ['createdAt', 'dueDate'] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type Priority = (typeof TASK_PRIORITIES)[number];
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];

export interface TaskEntity {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
