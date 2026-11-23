import type {
  DashboardStats,
  PaginatedTasks,
  Task,
  TaskInput,
  TaskListParams,
  TaskStatus,
} from '@/types/task';
import { request } from './apiClient';

function toQuery(params: Partial<TaskListParams>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') sp.set(key, String(value));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

export const taskService = {
  async list(params: Partial<TaskListParams>): Promise<PaginatedTasks> {
    const { data, meta } = await request<Task[]>(`/tasks${toQuery(params)}`);
    return { items: data, meta: meta! };
  },

  async get(id: string): Promise<Task> {
    return (await request<Task>(`/tasks/${id}`)).data;
  },

  async create(input: TaskInput): Promise<Task> {
    return (await request<Task>('/tasks', { method: 'POST', ...json(input) })).data;
  },

  async update(id: string, input: TaskInput): Promise<Task> {
    return (await request<Task>(`/tasks/${id}`, { method: 'PUT', ...json(input) })).data;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    return (await request<Task>(`/tasks/${id}/status`, { method: 'PATCH', ...json({ status }) })).data;
  },

  async remove(id: string): Promise<void> {
    await request<void>(`/tasks/${id}`, { method: 'DELETE' });
  },

  async stats(): Promise<DashboardStats> {
    return (await request<DashboardStats>('/tasks/stats')).data;
  },
};
