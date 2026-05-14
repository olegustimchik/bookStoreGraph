import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../configuration/datasource.config';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig())]
})
export class DatabaseModule {}