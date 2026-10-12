import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DivisionService } from './division.service';
import { DivisionController } from './division.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [DivisionController],
  providers: [DivisionService],
  exports: [DivisionService],
})
export class DivisionModule {}