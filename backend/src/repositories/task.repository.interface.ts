import type { Priority, SortOrder, TaskEntity, TaskSortField, TaskStatus } from '../domain/task.entity';

export interface TaskFilter {
  search?: string;
  status?: TaskStatus;
  priority?: Priority;
}

export interface TaskSort {
  field: TaskSortField;
  order: SortOrder;
}

export interface Pagination {
  skip: number;
  take: number;
}

export interface TaskCreateData {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date;
}

export type TaskUpdateData = Partial<TaskCreateData>;

export interface TaskCounts {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<Priority, number>;
  overdue: number;
}

/**
 * Persistence contract used by the service layer (Dependency Inversion).
 * The service depends on this interface, never on Prisma directly.
 */
export interface ITaskRepository {
  findMany(filter: TaskFilter, sort: TaskSort, pagination: Pagination): Promise<TaskEntity[]>;
  count(filter: TaskFilter): Promise<number>;
  findById(id: string): Promise<TaskEntity | null>;
  create(data: TaskCreateData): Promise<TaskEntity>;
  update(id: string, data: TaskUpdateData): Promise<TaskEntity>;
  delete(id: string): Promise<void>;
  /** Aggregate counts; `overdueBefore` is the cut-off for "overdue" (exclusive). */
  getCounts(overdueBefore: Date): Promise<TaskCounts>;
}
