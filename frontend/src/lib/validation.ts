import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/types/task';

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Enter a title')
    .max(150, 'Title must be 150 characters or fewer'),
  description: z.string().trim().max(2000, 'Description must be 2000 characters or fewer'),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z
    .string()
    .min(1, 'Choose a due date')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Enter a valid date'),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
