import type { Request, Response } from 'express';
import type {
  CreateTaskDto,
  ListTasksQueryDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from '../dtos/task.dto';
import type { TaskService } from '../services/task.service';
import { sendSuccess } from '../utils/apiResponse';

/**
 * HTTP adapter: reads the (already validated) request, calls the service and
 * writes the response. Contains no business logic.
 * Handlers are arrow properties so `this` stays bound when passed to the router.
 */
export class TaskController {
  constructor(private readonly service: TaskService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const { items, meta } = await this.service.list(req.query as unknown as ListTasksQueryDto);
    sendSuccess(res, items, 200, meta);
  };

  stats = async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.getDashboardStats());
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.getById(req.params.id));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.create(req.body as CreateTaskDto), 201);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.update(req.params.id, req.body as UpdateTaskDto));
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.service.updateStatus(req.params.id, req.body as UpdateTaskStatusDto));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(req.params.id);
    res.status(204).send();
  };
}
