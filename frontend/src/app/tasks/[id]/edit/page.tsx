import type { Metadata } from 'next';
import { EditTaskScreen } from '@/components/tasks/TaskFormScreen';

export const metadata: Metadata = { title: 'Edit task' };

export default function EditTaskPage({ params }: { params: { id: string } }) {
  return <EditTaskScreen id={params.id} />;
}
