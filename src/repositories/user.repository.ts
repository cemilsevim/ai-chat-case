import { User } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<User> {
    protected override get model() {
        return this.prisma.user;
    }
}
