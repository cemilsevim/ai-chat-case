import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from 'prisma/config';
import { getDatabaseConfig } from '../../configs';

const { databaseUrl } = getDatabaseConfig();

export default defineConfig({
    schema: './prisma.schema',
    datasource: {
        url: databaseUrl,
    },
});
