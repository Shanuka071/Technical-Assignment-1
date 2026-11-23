export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'] as const;
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type Priority = (typeof TASK_PRIORITIES)[number];
export type SortBy = 'createdAt' | 'dueDate';
export type SortOrder = 'asc' | 'desc';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTasks {
  items: Task[];
  meta: PaginationMeta;
}

export interface TaskListParams {
  page: number;
  limit: number;
  search?: string;
  status?: TaskStatus;
  priority?: Priority;
  sortBy: SortBy;
  order: SortOrder;
}

export interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionRate: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<Priority, number>;
}

export interface FieldError {
  field: string;
  message: string;
}
