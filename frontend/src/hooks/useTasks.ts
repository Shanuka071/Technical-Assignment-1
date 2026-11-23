import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/services/apiClient';
import { taskService } from '@/services/taskService';
import type { PaginatedTasks, Task, TaskInput, TaskListParams, TaskStatus } from '@/types/task';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: Partial<TaskListParams>) => [...taskKeys.lists(), params] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  stats: () => [...taskKeys.all, 'stats'] as const,
};

export function useTasks(params: Partial<TaskListParams>) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => taskService.list(params),
    placeholderData: keepPreviousData, // no flicker while paging / filtering
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.get(id),
    retry: (count, error) => !(error instanceof ApiError && error.status < 500 && error.status !== 0) && count < 2,
  });
}

export function useDashboardStats() {
  return useQuery({ queryKey: taskKeys.stats(), queryFn: taskService.stats });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => taskService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TaskInput }) => taskService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: taskKeys.detail(id) });
      return qc.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

/** Status changes update the UI immediately and roll back if the server rejects them. */
export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => taskService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: taskKeys.all });
      const previousLists = qc.getQueriesData<PaginatedTasks>({ queryKey: taskKeys.lists() });
      const previousDetail = qc.getQueryData<Task>(taskKeys.detail(id));

      qc.setQueriesData<PaginatedTasks>({ queryKey: taskKeys.lists() }, (old) =>
        old ? { ...old, items: old.items.map((t) => (t.id === id ? { ...t, status } : t)) } : old,
      );
      if (previousDetail) qc.setQueryData<Task>(taskKeys.detail(id), { ...previousDetail, status });

      return { previousLists, previousDetail };
    },
    onError: (_error, { id }, context) => {
      context?.previousLists.forEach(([key, data]) => qc.setQueryData(key, data));
      if (context?.previousDetail) qc.setQueryData(taskKeys.detail(id), context.previousDetail);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}
