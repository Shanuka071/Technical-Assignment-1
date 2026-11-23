'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buttonClass } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { useCreateTask, useTask, useUpdateTask } from '@/hooks/useTasks';
import { getErrorMessage } from '@/lib/errors';
import { toDateInputValue } from '@/lib/utils';
import type { TaskFormValues } from '@/lib/validation';
import { TaskForm } from './TaskForm';

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
      <div className="card p-6">{children}</div>
    </div>
  );
}

export function CreateTaskScreen() {
  const router = useRouter();
  const toast = useToast();
  const createTask = useCreateTask();

  const handleSubmit = async (values: TaskFormValues) => {
    const task = await createTask.mutateAsync(values);
    toast.success('Task created');
    router.push(`/tasks/${task.id}`);
  };

  return (
    <FormCard title="New task">
      <TaskForm submitLabel="Create task" cancelHref="/tasks" onSubmit={handleSubmit} />
    </FormCard>
  );
}

export function EditTaskScreen({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: task, isLoading, isError, error, refetch } = useTask(id);
  const updateTask = useUpdateTask();

  if (isLoading) return <PageLoader label="Loading task" />;
  if (isError || !task) {
    return (
      <ErrorState
        title="Could not load task"
        message={getErrorMessage(error)}
        onRetry={() => refetch()}
        action={<Link href="/tasks" className={buttonClass('secondary')}>Back to tasks</Link>}
      />
    );
  }

  const handleSubmit = async (values: TaskFormValues) => {
    await updateTask.mutateAsync({ id, input: values });
    toast.success('Task updated');
    router.push(`/tasks/${id}`);
  };

  return (
    <FormCard title="Edit task">
      <TaskForm
        submitLabel="Save changes"
        cancelHref={`/tasks/${id}`}
        defaultValues={{
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          dueDate: toDateInputValue(task.dueDate),
        }}
        onSubmit={handleSubmit}
      />
    </FormCard>
  );
}
