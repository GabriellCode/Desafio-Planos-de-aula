import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.lessonPlan.findMany();
  console.log(plans.map(p => ({ id: p.id, subject: p.subject })));
}
main().finally(() => prisma.$disconnect());
