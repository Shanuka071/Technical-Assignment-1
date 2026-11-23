import type {
  CreateTaskDto,
  DashboardStatsDto,
  ListTasksQueryDto,
  PaginatedTasksDto,
  TaskResponseDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
} from '../dtos/task.dto';
import { NotFoundError } from '../errors/AppError';
import { TaskMapper } from '../mappers/task.mapper';
import type { ITaskRepository, TaskFilter } from '../repositories/task.repository.interface';
import { startOfTodayUtc } from '../utils/dates';

/** Business logic. Knows nothing about HTTP or about how data is stored. */
export class TaskService {
  constructor(
    private readonly repository: ITaskRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async list(query: ListTasksQueryDto): Promise<PaginatedTasksDto> {
    const filter: TaskFilter = { search: query.search, status: query.status, priority: query.priority };
    const [entities, total] = await Promise.all([
      this.repository.findMany(
        filter,
        { field: query.sortBy, order: query.order },
        { skip: (query.page - 1) * query.limit, take: query.limit },
      ),
      this.repository.count(filter),
    ]);

    return {
      items: TaskMapper.toResponseList(entities, this.clock()),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  async getById(id: string): Promise<TaskResponseDto> {
    return TaskMapper.toResponse(await this.findOrFail(id), this.clock());
  }

  async create(dto: CreateTaskDto): Promise<TaskResponseDto> {
    const entity = await this.repository.create(TaskMapper.toCreateData(dto));
    return TaskMapper.toResponse(entity, this.clock());
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    await this.findOrFail(id);
    const entity = await this.repository.update(id, TaskMapper.toCreateData(dto));
    return TaskMapper.toResponse(entity, this.clock());
  }

  async updateStatus(id: string, dto: UpdateTaskStatusDto): Promise<TaskResponseDto> {
    await this.findOrFail(id);
    const entity = await this.repository.update(id, { status: dto.status });
    return TaskMapper.toResponse(entity, this.clock());
  }

  async delete(id: string): Promise<void> {
    await this.findOrFail(id);
    await this.repository.delete(id);
  }

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const counts = await this.repository.getCounts(startOfTodayUtc(this.clock()));
    return TaskMapper.toStatsResponse(counts);
  }

  private async findOrFail(id: string) {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundError('Task', id);
    return entity;
  }
}
