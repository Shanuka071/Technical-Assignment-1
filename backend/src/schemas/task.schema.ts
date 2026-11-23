import { z } from 'zod';
import { SORT_ORDERS, TASK_PRIORITIES, TASK_SORT_FIELDS, TASK_STATUSES } from '../domain/task.entity';
import { stripHtml } from '../utils/sanitize';

const enumMessage = (label: string, values: readonly string[]) => ({
  errorMap: () => ({ message: `${label} must be one of: ${values.join(', ')}` }),
});

const statusSchema = z.enum(TASK_STATUSES, enumMessage('Status', TASK_STATUSES));
const prioritySchema = z.enum(TASK_PRIORITIES, enumMessage('Priority', TASK_PRIORITIES));

const title = z
  .string({ required_error: 'Title is required', invalid_type_error: 'Title must be text' })
  .transform(stripHtml)
  .pipe(
    z
      .string()
      .min(1, 'Title is required')
      .max(150, 'Title must be at most 150 characters'),
  );

const description = z
  .string({ invalid_type_error: 'Description must be text' })
  .transform(stripHtml)
  .pipe(z.string().max(2000, 'Description must be at most 2000 characters'))
  .nullish()
  .transform((value) => value || null);

const dueDate = z
  .string({ required_error: 'Due date is required', invalid_type_error: 'Due date must be a date string' })
  .min(1, 'Due date is required')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Due date must be a valid date (YYYY-MM-DD)');

/** Request body for POST /tasks and PUT /tasks/:id */
export const createTaskSchema = z.object({
  title,
  description,
  status: statusSchema.default('TODO'),
  priority: prioritySchema.default('MEDIUM'),
  dueDate,
});

/** Request body for PUT /tasks/:id (full replacement of editable fields) */
export const updateTaskSchema = createTaskSchema;

/** Request body for PATCH /tasks/:id/status */
export const updateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES, {
    errorMap: (issue, ctx) => ({
      message:
        issue.code === 'invalid_type' && ctx.data === undefined
          ? 'Status is required'
          : `Status must be one of: ${TASK_STATUSES.join(', ')}`,
    }),
  }),
});

export const taskIdParamSchema = z.object({
  id: z.string().uuid('Task id must be a valid UUID'),
});

/** Query string for GET /tasks */
export const listTasksQuerySchema = z.object({
  page: z.coerce.number({ invalid_type_error: 'Page must be a number' }).int('Page must be an integer').min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number({ invalid_type_error: 'Limit must be a number' }).int('Limit must be an integer').min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(10),
  search: z
    .string()
    .trim()
    .max(100, 'Search must be at most 100 characters')
    .optional()
    .transform((value) => value || undefined),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  sortBy: z.enum(TASK_SORT_FIELDS, enumMessage('sortBy', TASK_SORT_FIELDS)).default('createdAt'),
  order: z.enum(SORT_ORDERS, enumMessage('order', SORT_ORDERS)).default('desc'),
});
