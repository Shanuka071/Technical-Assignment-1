'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, buttonClass } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { taskFormSchema, type TaskFormValues } from '@/lib/validation';
import { ApiError } from '@/services/apiClient';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/types/task';

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

const emptyValues: TaskFormValues = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '' };

const describedBy = (id: string, hasError: boolean) => (hasError ? `${id}-error` : undefined);

export function TaskForm({ defaultValues, submitLabel, cancelHref, onSubmit }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { ...emptyValues, ...defaultValues },
  });
  const [formError, setFormError] = useState<string | null>(null);
  // Synchronous guard: blocks a second submit fired before React re-renders the disabled button.
  const inFlight = useRef(false);

  const submit = handleSubmit(async (values) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setFormError(null);
    try {
      await onSubmit(values);
      // On success the page navigates away; keep the guard on so a late click can't re-submit.
    } catch (error) {
      inFlight.current = false;
      const details = error instanceof ApiError ? error.details : [];
      const fields = new Set(Object.keys(values));
      const unmatched = details.filter((d) => !fields.has(d.field));
      details
        .filter((d) => fields.has(d.field))
        .forEach((d) => setError(d.field as keyof TaskFormValues, { type: 'server', message: d.message }));
      if (details.length === 0 || unmatched.length > 0) setFormError(getErrorMessage(error));
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-5" aria-busy={isSubmitting}>
      {formError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300">
          {formError}
        </div>
      )}

      <FormField label="Title" htmlFor="title" required error={errors.title?.message}>
        <input id="title" className="input" placeholder="e.g. Prepare sprint demo" maxLength={150} aria-invalid={!!errors.title} aria-describedby={describedBy('title', !!errors.title)} {...register('title')} />
      </FormField>

      <FormField label="Description" htmlFor="description" error={errors.description?.message} hint="Optional. Up to 2000 characters.">
        <textarea id="description" rows={4} className="input resize-y" aria-invalid={!!errors.description} aria-describedby={describedBy('description', !!errors.description)} {...register('description')} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Status" htmlFor="status" error={errors.status?.message}>
          <select id="status" className="input" aria-invalid={!!errors.status} {...register('status')}>
            {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </FormField>
        <FormField label="Priority" htmlFor="priority" error={errors.priority?.message}>
          <select id="priority" className="input" aria-invalid={!!errors.priority} {...register('priority')}>
            {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
        </FormField>
        <FormField label="Due date" htmlFor="dueDate" required error={errors.dueDate?.message}>
          <input id="dueDate" type="date" className="input" aria-invalid={!!errors.dueDate} aria-describedby={describedBy('dueDate', !!errors.dueDate)} {...register('dueDate')} />
        </FormField>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-5 dark:border-slate-800">
        <Link href={cancelHref} className={buttonClass('secondary')}>Cancel</Link>
        <Button type="submit" loading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
