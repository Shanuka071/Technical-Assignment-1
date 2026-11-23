import type { z } from 'zod';
import type { Priority, TaskStatus } from '../domain/task.entity';
import type {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../schemas/task.schema';

// ---- Request DTOs (derived from the validation schemas, so they can never drift) ----
export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusDto = z.infer<typeof updateTaskStatusSchema>;
export type ListTasksQueryDto = z.infer<typeof listTasksQuerySchema>;

// ---- Response DTOs ----
export interface TaskResponseDto {
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

export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTasksDto {
  items: TaskResponseDto[];
  meta: PaginationMetaDto;
}

export interface DashboardStatsDto {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionRate: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<Priority, number>;
}
