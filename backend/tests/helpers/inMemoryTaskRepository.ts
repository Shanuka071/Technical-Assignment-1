import { randomUUID } from 'node:crypto';
import { TASK_PRIORITIES, TASK_STATUSES, type TaskEntity } from '../../src/domain/task.entity';
import type {
  ITaskRepository,
  Pagination,
  TaskCounts,
  TaskCreateData,
  TaskFilter,
  TaskSort,
  TaskUpdateData,
} from '../../src/repositories/task.repository.interface';

/** Test double that implements the repository contract in memory. */
export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: TaskEntity[] = [];
  private tick = 0;

  private matches(t: TaskEntity, f: TaskFilter): boolean {
    return (
      (!f.search || t.title.toLowerCase().includes(f.search.toLowerCase())) &&
      (!f.status || t.status === f.status) &&
      (!f.priority || t.priority === f.priority)
    );
  }

  async findMany(filter: TaskFilter, sort: TaskSort, { skip, take }: Pagination): Promise<TaskEntity[]> {
    return this.tasks
      .filter((t) => this.matches(t, filter))
      .sort((a, b) => {
        const diff = a[sort.field].getTime() - b[sort.field].getTime();
        return sort.order === 'asc' ? diff : -diff;
      })
      .slice(skip, skip + take);
  }

  async count(filter: TaskFilter): Promise<number> {
    return this.tasks.filter((t) => this.matches(t, filter)).length;
  }

  async findById(id: string): Promise<TaskEntity | null> {
    return this.tasks.find((t) => t.id === id) ?? null;
  }

  async create(data: TaskCreateData): Promise<TaskEntity> {
    const now = new Date(Date.now() + this.tick++);
    const task: TaskEntity = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
    this.tasks.push(task);
    return task;
  }

  async update(id: string, data: TaskUpdateData): Promise<TaskEntity> {
    const index = this.tasks.findIndex((t) => t.id === id);
    this.tasks[index] = { ...this.tasks[index], ...data, updatedAt: new Date() };
    return this.tasks[index];
  }

  async delete(id: string): Promise<void> {
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }

  async getCounts(overdueBefore: Date): Promise<TaskCounts> {
    const byStatus = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0])) as TaskCounts['byStatus'];
    const byPriority = Object.fromEntries(TASK_PRIORITIES.map((p) => [p, 0])) as TaskCounts['byPriority'];
    this.tasks.forEach((t) => {
      byStatus[t.status]++;
      byPriority[t.priority]++;
    });
    return {
      total: this.tasks.length,
      byStatus,
      byPriority,
      overdue: this.tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate < overdueBefore).length,
    };
  }
}
