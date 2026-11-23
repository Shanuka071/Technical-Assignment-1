import Link from 'next/link';
import { cn, formatDate } from '@/lib/utils';
import type { Task, TaskListParams, TaskStatus } from '@/types/task';
import { PriorityBadge } from './Badges';
import { DueDate } from './DueDate';
import { StatusSelect } from './StatusSelect';
import { TaskActions } from './TaskActions';
import { TaskCard } from './TaskCard';

interface TaskTableProps {
  tasks: Task[];
  sortBy: TaskListParams['sortBy'];
  stale?: boolean;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onDelete: (task: Task) => void;
}

export function TaskTable({ tasks, stale, onStatusChange, onDelete }: TaskTableProps) {
  return (
    <div className={cn('transition-opacity', stale && 'opacity-60')} aria-busy={stale}>
      {/* Tablet / desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Tasks</caption>
          <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Title</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Priority</th>
              <th scope="col" className="px-4 py-3 font-medium">Due date</th>
              <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Created</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="max-w-xs px-4 py-3">
                  <Link href={`/tasks/${task.id}`} className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400">
                    {task.title}
                  </Link>
                  {task.description && (
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusSelect value={task.status} taskTitle={task.title} onChange={(s) => onStatusChange(task, s)} className="text-xs" />
                </td>
                <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                <td className="whitespace-nowrap px-4 py-3"><DueDate task={task} /></td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-slate-500 lg:table-cell dark:text-slate-400">{formatDate(task.createdAt)}</td>
                <td className="px-4 py-3"><TaskActions task={task} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="space-y-3 p-3 md:hidden">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard task={task} onStatusChange={(t, s) => onStatusChange(t, s)} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </div>
  );
}
