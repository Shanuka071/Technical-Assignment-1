import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import type { TaskService } from '../services/task.service';
import { createTaskRouter } from './task.routes';

export function createApiRouter(taskService: TaskService): Router {
  const router = Router();
  router.use('/tasks', createTaskRouter(new TaskController(taskService)));
  return router;
}
