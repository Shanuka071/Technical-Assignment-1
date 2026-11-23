import { Router } from 'express';
import type { TaskController } from '../controllers/task.controller';
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../schemas/task.schema';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../validations/validate';

export function createTaskRouter(controller: TaskController): Router {
  const router = Router();
  const validId = validate(taskIdParamSchema, 'params');

  // NOTE: '/stats' must be registered before '/:id'
  router.get('/stats', asyncHandler(controller.stats));
  router.get('/', validate(listTasksQuerySchema, 'query'), asyncHandler(controller.list));
  router.post('/', validate(createTaskSchema), asyncHandler(controller.create));
  router.get('/:id', validId, asyncHandler(controller.getById));
  router.put('/:id', validId, validate(updateTaskSchema), asyncHandler(controller.update));
  router.patch('/:id/status', validId, validate(updateTaskStatusSchema), asyncHandler(controller.updateStatus));
  router.delete('/:id', validId, asyncHandler(controller.remove));

  return router;
}
