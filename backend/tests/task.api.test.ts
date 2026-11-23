import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { TaskService } from '../src/services/task.service';
import { InMemoryTaskRepository } from './helpers/inMemoryTaskRepository';

const validBody = { title: 'Write tests', description: 'Cover the API', priority: 'HIGH', dueDate: '2030-01-15' };

describe('Task API', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp(new TaskService(new InMemoryTaskRepository()));
  });

  it('POST /tasks creates a task (201) with defaults applied', async () => {
    const res = await request(app).post('/api/v1/tasks').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, data: { title: 'Write tests', status: 'TODO', priority: 'HIGH' } });
  });

  it('POST /tasks returns 422 with per-field messages for invalid input', async () => {
    const res = await request(app).post('/api/v1/tasks').send({ title: '   ', priority: 'URGENT' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['title', 'priority', 'dueDate']));
  });

  it('sanitises HTML out of text fields', async () => {
    const res = await request(app).post('/api/v1/tasks').send({ ...validBody, title: '<script>x</script>Clean title' });
    expect(res.body.data.title).toBe('xClean title');
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app).post('/api/v1/tasks').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  it('GET /tasks/:id validates the id and returns 404 when missing', async () => {
    expect((await request(app).get('/api/v1/tasks/not-a-uuid')).status).toBe(422);
    expect((await request(app).get('/api/v1/tasks/6f1c6d7e-2b5a-4a53-9a6e-0f6b8f0b8a11')).status).toBe(404);
  });

  it('GET /tasks lists with pagination meta and rejects bad query params', async () => {
    await request(app).post('/api/v1/tasks').send(validBody);
    const ok = await request(app).get('/api/v1/tasks?page=1&limit=5&status=TODO&sortBy=dueDate&order=asc');
    expect(ok.status).toBe(200);
    expect(ok.body.data).toHaveLength(1);
    expect(ok.body.meta).toEqual({ page: 1, limit: 5, total: 1, totalPages: 1 });
    expect((await request(app).get('/api/v1/tasks?limit=1000')).status).toBe(422);
  });

  it('supports update, status change, stats and delete', async () => {
    const { body } = await request(app).post('/api/v1/tasks').send(validBody);
    const id = body.data.id;

    const put = await request(app).put(`/api/v1/tasks/${id}`).send({ ...validBody, title: 'Renamed' });
    expect(put.body.data.title).toBe('Renamed');

    const patch = await request(app).patch(`/api/v1/tasks/${id}/status`).send({ status: 'COMPLETED' });
    expect(patch.body.data.status).toBe('COMPLETED');
    expect((await request(app).patch(`/api/v1/tasks/${id}/status`).send({ status: 'DONE' })).status).toBe(422);

    const stats = await request(app).get('/api/v1/tasks/stats');
    expect(stats.body.data).toMatchObject({ total: 1, completed: 1, completionRate: 100 });

    expect((await request(app).delete(`/api/v1/tasks/${id}`)).status).toBe(204);
    expect((await request(app).get(`/api/v1/tasks/${id}`)).status).toBe(404);
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
