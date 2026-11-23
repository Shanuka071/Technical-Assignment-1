import type { Metadata } from 'next';
import { CreateTaskScreen } from '@/components/tasks/TaskFormScreen';

export const metadata: Metadata = { title: 'New task' };

export default function NewTaskPage() {
  return <CreateTaskScreen />;
}
