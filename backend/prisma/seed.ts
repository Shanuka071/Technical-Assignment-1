import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Midnight UTC, `offset` days from today. */
const day = (offset: number): Date => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
};

const tasks: Prisma.TaskCreateManyInput[] = [
  { title: 'Fix login redirect bug', description: 'Users are sent to a blank page after signing in on Safari.', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: day(-2) },
  { title: 'Update onboarding emails', description: 'Replace the old brand copy in all three welcome emails.', status: 'TODO', priority: 'MEDIUM', dueDate: day(-5) },
  { title: 'Write Q4 release notes', description: 'Summarise shipped features for the changelog.', status: 'TODO', priority: 'LOW', dueDate: day(3) },
  { title: 'Design settings page', description: 'Wireframes and a first pass of the high-fidelity mockups.', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: day(5) },
  { title: 'Set up CI pipeline', description: 'Run lint, type-check and tests on every pull request.', status: 'COMPLETED', priority: 'HIGH', dueDate: day(-7) },
  { title: 'Migrate images to CDN', description: null, status: 'COMPLETED', priority: 'LOW', dueDate: day(-1) },
  { title: 'Review pull request #142', description: 'Payments refactor from the backend team.', status: 'TODO', priority: 'HIGH', dueDate: day(1) },
  { title: 'Prepare sprint demo', description: 'Collect screenshots and short clips from each squad.', status: 'TODO', priority: 'MEDIUM', dueDate: day(7) },
  { title: 'Audit npm dependencies', description: 'Remove unused packages and upgrade vulnerable ones.', status: 'IN_PROGRESS', priority: 'LOW', dueDate: day(10) },
  { title: 'Customer interview synthesis', description: 'Cluster notes from the last 8 interviews.', status: 'TODO', priority: 'MEDIUM', dueDate: day(14) },
  { title: 'Add rate limiting to API', description: 'Protect public endpoints from abuse.', status: 'COMPLETED', priority: 'HIGH', dueDate: day(-10) },
  { title: 'Accessibility review', description: 'Check keyboard navigation and colour contrast on key flows.', status: 'TODO', priority: 'HIGH', dueDate: day(2) },
];

async function main(): Promise<void> {
  await prisma.task.deleteMany();
  const result = await prisma.task.createMany({ data: tasks });
  console.log(`Seeded ${result.count} tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
