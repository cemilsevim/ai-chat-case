import { getDatabaseConfig } from '../../configs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { databaseUrl } = getDatabaseConfig();

const adapter = new PrismaPg({
    connectionString: databaseUrl,
});

export const prisma = new PrismaClient({
    adapter,
});
