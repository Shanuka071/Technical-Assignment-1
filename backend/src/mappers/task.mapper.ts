import type { TaskEntity } from '../domain/task.entity';
import type { CreateTaskDto, DashboardStatsDto, TaskResponseDto } from '../dtos/task.dto';
import type { TaskCounts, TaskCreateData } from '../repositories/task.repository.interface';
import { isOverdue } from '../utils/dates';

/** Converts between request DTOs, domain entities and response DTOs. */
export class TaskMapper {
  static toResponse(entity: TaskEntity, now: Date = new Date()): TaskResponseDto {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      priority: entity.priority,
      dueDate: entity.dueDate.toISOString(),
      isOverdue: isOverdue(entity.dueDate, entity.status, now),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static toResponseList(entities: TaskEntity[], now: Date = new Date()): TaskResponseDto[] {
    return entities.map((entity) => TaskMapper.toResponse(entity, now));
  }

  /** Request DTO (string dates) -> persistence data (Date objects). */
  static toCreateData(dto: CreateTaskDto): TaskCreateData {
    return {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      dueDate: new Date(dto.dueDate),
    };
  }

  static toStatsResponse(counts: TaskCounts): DashboardStatsDto {
    const completed = counts.byStatus.COMPLETED;
    return {
      total: counts.total,
      completed,
      inProgress: counts.byStatus.IN_PROGRESS,
      pending: counts.byStatus.TODO,
      overdue: counts.overdue,
      completionRate: counts.total === 0 ? 0 : Math.round((completed / counts.total) * 100),
      byStatus: counts.byStatus,
      byPriority: counts.byPriority,
    };
  }
}
