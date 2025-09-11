import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default () => {
  async function checkConnection() {
    try {
      // Attempt a simple query to check the connection
      await prisma.$queryRaw`SELECT 1`;
      console.log('PostgreSQL connection is live');
    } catch (error) {
      console.error('Error connecting to PostgreSQL', error);
    } finally {
      await prisma.$disconnect(); // Disconnect Prisma Client
    }
  }

  checkConnection();
};
