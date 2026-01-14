export type DatabaseConfig = {
    databaseUrl: string;
};

export const getDatabaseConfig = (): DatabaseConfig => {
    const databaseUrl = process.env.DATABASE_URL?.trim();

    if (!databaseUrl) {
        throw new Error(
            'DATABASE_URL environment variable is required for Prisma.',
        );
    }

    return {
        databaseUrl,
    };
};
