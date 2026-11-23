import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TasksListView } from '@/components/tasks/TasksListView';
import { PageLoader } from '@/components/ui/Spinner';

export const metadata: Metadata = { title: 'Tasks' };

export default function TasksPage() {
  // useSearchParams() in the list view requires a Suspense boundary.
  return (
    <Suspense fallback={<PageLoader label="Loading tasks" />}>
      <TasksListView />
    </Suspense>
  );
}
