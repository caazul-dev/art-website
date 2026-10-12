import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FleetService } from './fleet.service';
import { FleetController } from './fleet.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [FleetController],
  providers: [FleetService],
  exports: [FleetService],
})
export class FleetModule {}