import type { Prisma, PrismaClient } from '@prisma/client';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Priority,
  type TaskEntity,
  type TaskStatus,
} from '../domain/task.entity';
import type {
  ITaskRepository,
  Pagination,
  TaskCounts,
  TaskCreateData,
  TaskFilter,
  TaskSort,
  TaskUpdateData,
} from './task.repository.interface';

/** The only place in the backend that talks to the database. */
export class TaskRepository implements ITaskRepository {
  constructor(private readonly db: PrismaClient) {}

  async findMany(filter: TaskFilter, sort: TaskSort, { skip, take }: Pagination): Promise<TaskEntity[]> {
    const orderBy: Prisma.TaskOrderByWithRelationInput =
      sort.field === 'dueDate' ? { dueDate: sort.order } : { createdAt: sort.order };

    return this.db.task.findMany({
      where: this.buildWhere(filter),
      // `id` as a tie-breaker keeps pagination stable when sort values are equal.
      orderBy: [orderBy, { id: 'asc' }],
      skip,
      take,
    });
  }

  count(filter: TaskFilter): Promise<number> {
    return this.db.task.count({ where: this.buildWhere(filter) });
  }

  findById(id: string): Promise<TaskEntity | null> {
    return this.db.task.findUnique({ where: { id } });
  }

  create(data: TaskCreateData): Promise<TaskEntity> {
    return this.db.task.create({ data });
  }

  update(id: string, data: TaskUpdateData): Promise<TaskEntity> {
    return this.db.task.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.task.delete({ where: { id } });
  }

  async getCounts(overdueBefore: Date): Promise<TaskCounts> {
    const [total, statusGroups, priorityGroups, overdue] = await Promise.all([
      this.db.task.count(),
      this.db.task.groupBy({ by: ['status'], _count: { _all: true } }),
      this.db.task.groupBy({ by: ['priority'], _count: { _all: true } }),
      this.db.task.count({
        where: { dueDate: { lt: overdueBefore }, status: { not: 'COMPLETED' } },
      }),
    ]);

    const byStatus = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0])) as Record<TaskStatus, number>;
    const byPriority = Object.fromEntries(TASK_PRIORITIES.map((p) => [p, 0])) as Record<Priority, number>;
    statusGroups.forEach((g) => (byStatus[g.status] = g._count._all));
    priorityGroups.forEach((g) => (byPriority[g.priority] = g._count._all));

    return { total, byStatus, byPriority, overdue };
  }

  private buildWhere(filter: TaskFilter): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};
    if (filter.search) where.title = { contains: filter.search, mode: 'insensitive' };
    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    return where;
  }
}
