import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.story.count({ where: { status: 'PUBLISHED' } });
  console.log('Published stories:', count);
  
  const allCount = await prisma.story.count();
  console.log('All stories:', allCount);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
