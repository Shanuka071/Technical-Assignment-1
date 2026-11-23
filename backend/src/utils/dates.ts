import type { TaskStatus } from '../domain/task.entity';

/** Start (00:00 UTC) of the day containing `now`. Due dates are stored as UTC midnight. */
export function startOfTodayUtc(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** A task is overdue when its due date is before today and it is not completed. */
export function isOverdue(dueDate: Date, status: TaskStatus, now: Date = new Date()): boolean {
  return status !== 'COMPLETED' && dueDate.getTime() < startOfTodayUtc(now).getTime();
}
