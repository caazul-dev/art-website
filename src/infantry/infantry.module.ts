import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { InfantryService } from './infantry.service';
import { InfantryController } from './infantry.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [InfantryController],
  providers: [InfantryService],
  exports: [InfantryService],
})
export class InfantryModule {}