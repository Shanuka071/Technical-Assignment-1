import { beforeEach, describe, expect, it } from 'vitest';
import type { CreateTaskDto, ListTasksQueryDto } from '../src/dtos/task.dto';
import { NotFoundError } from '../src/errors/AppError';
import { TaskService } from '../src/services/task.service';
import { InMemoryTaskRepository } from './helpers/inMemoryTaskRepository';

const NOW = new Date('2026-11-23T10:00:00Z');

const task = (overrides: Partial<CreateTaskDto> = {}): CreateTaskDto => ({
  title: 'Write report',
  description: null,
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '2026-12-01',
  ...overrides,
});

const query = (overrides: Partial<ListTasksQueryDto> = {}): ListTasksQueryDto => ({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  order: 'desc',
  ...overrides,
});

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService(new InMemoryTaskRepository(), () => NOW);
  });

  it('creates a task and returns it with ISO dates', async () => {
    const created = await service.create(task({ title: 'Ship it' }));
    expect(created.id).toBeTruthy();
    expect(created.dueDate).toBe('2026-12-01T00:00:00.000Z');
    expect(await service.getById(created.id)).toMatchObject({ title: 'Ship it', status: 'TODO' });
  });

  it('throws NotFoundError for unknown ids', async () => {
    await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.updateStatus('missing', { status: 'COMPLETED' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('updates a task and its status', async () => {
    const { id } = await service.create(task());
    const updated = await service.update(id, task({ title: 'Renamed', priority: 'HIGH' }));
    expect(updated).toMatchObject({ title: 'Renamed', priority: 'HIGH' });
    expect((await service.updateStatus(id, { status: 'IN_PROGRESS' })).status).toBe('IN_PROGRESS');
  });

  it('deletes a task', async () => {
    const { id } = await service.create(task());
    await service.delete(id);
    await expect(service.getById(id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('filters by search, status and priority', async () => {
    await service.create(task({ title: 'Fix Login bug', priority: 'HIGH' }));
    await service.create(task({ title: 'Write docs', status: 'COMPLETED' }));
    await service.create(task({ title: 'Login page design', status: 'COMPLETED', priority: 'HIGH' }));

    expect((await service.list(query({ search: 'login' }))).meta.total).toBe(2);
    expect((await service.list(query({ status: 'COMPLETED' }))).meta.total).toBe(2);
    expect((await service.list(query({ search: 'login', status: 'COMPLETED', priority: 'HIGH' }))).items).toHaveLength(1);
  });

  it('sorts by due date', async () => {
    await service.create(task({ title: 'B', dueDate: '2026-12-10' }));
    await service.create(task({ title: 'A', dueDate: '2026-12-02' }));
    const asc = await service.list(query({ sortBy: 'dueDate', order: 'asc' }));
    expect(asc.items.map((t) => t.title)).toEqual(['A', 'B']);
  });

  it('paginates and reports metadata', async () => {
    for (let i = 0; i < 5; i++) await service.create(task({ title: `Task ${i}` }));
    const page2 = await service.list(query({ page: 2, limit: 2 }));
    expect(page2.items).toHaveLength(2);
    expect(page2.meta).toEqual({ page: 2, limit: 2, total: 5, totalPages: 3 });
  });

  it('flags only unfinished tasks with a past due date as overdue', async () => {
    await service.create(task({ title: 'late', dueDate: '2026-11-01' }));
    await service.create(task({ title: 'late but done', dueDate: '2026-11-01', status: 'COMPLETED' }));
    await service.create(task({ title: 'due today', dueDate: '2026-11-23' }));

    const { items } = await service.list(query());
    const overdue = Object.fromEntries(items.map((t) => [t.title, t.isOverdue]));
    expect(overdue).toEqual({ late: true, 'late but done': false, 'due today': false });

    const stats = await service.getDashboardStats();
    expect(stats).toMatchObject({ total: 3, overdue: 1, completed: 1, pending: 2, inProgress: 0, completionRate: 33 });
  });

  it('returns zeroed stats when there are no tasks', async () => {
    expect(await service.getDashboardStats()).toMatchObject({ total: 0, completionRate: 0, overdue: 0 });
  });
});
