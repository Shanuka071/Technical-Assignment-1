import type { Metadata } from 'next';
import { TaskDetailView } from '@/components/tasks/TaskDetailView';

export const metadata: Metadata = { title: 'Task details' };

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return <TaskDetailView id={params.id} />;
}
