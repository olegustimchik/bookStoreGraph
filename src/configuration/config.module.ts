import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './datasource.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [() =>  databaseConfig], // Placeholder for additional configuration loading if needed
        }),
    ],
})
export class ConfigurationModule {}