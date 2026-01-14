import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<TEntity> {
    constructor(protected readonly prisma: PrismaClient) {}

    protected abstract get model(): any;

    async findById(id: string): Promise<TEntity | null> {
        return await this.model.findUnique({
            where: { id },
        });
    }

    async findOne(criteria: Partial<TEntity>): Promise<TEntity | null> {
        return await this.model.findFirst({
            where: criteria,
        });
    }

    async findMany(criteria?: Partial<TEntity>): Promise<TEntity[]> {
        return await this.model.findMany({
            where: criteria,
        });
    }

    async save(entity: Partial<TEntity>): Promise<TEntity> {
        return await this.model.create({
            data: entity,
        });
    }

    async delete(id: string): Promise<void> {
        await this.model.delete({
            where: { id },
        });
    }

    async exists(id: string): Promise<boolean> {
        const row = await this.model.findUnique({
            where: { id },
            select: { id: true },
        });
        return !!row;
    }
}
