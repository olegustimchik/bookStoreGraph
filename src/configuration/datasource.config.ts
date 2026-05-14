import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import SnakeNamingStrategy from './snake-naming.strategy';
import { getEnvOrDefault } from '../common/utils/get-env-or-default';
import DatabaseLogger from '../database/database.logger';
import type { DataSourceOptions } from 'typeorm';

// Load environment variables
config();

export const databaseConfig = (): DataSourceOptions => { 
    return {
        type: 'postgres' as const,
        host: getEnvOrDefault('DATABASE_HOST', 'localhost'),
        port: parseInt(getEnvOrDefault('DATABASE_PORT', '5432')),
        username: getEnvOrDefault('DATABASE_USERNAME', 'root'),
        password: getEnvOrDefault('DATABASE_PASSWORD', 'password'),
        database: getEnvOrDefault('DATABASE_NAME', 'db'),

        entities: [__dirname + '/../modules/**/entities/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],

        synchronize: false,
        migrationsRun: true,
        migrationsTransactionMode: 'each' as const,
        logging: Boolean(getEnvOrDefault('DATABASE_LOGGING', false)),
        logger: new DatabaseLogger(),

        namingStrategy: new SnakeNamingStrategy(),
    }
}

export const dataSource = new DataSource(databaseConfig());
