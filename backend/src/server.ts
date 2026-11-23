import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { TaskRepository } from './repositories/task.repository';
import { TaskService } from './services/task.service';

// Composition root: the only place where concrete classes are wired together.
const taskService = new TaskService(new TaskRepository(prisma));
const app = createApp(taskService);

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
