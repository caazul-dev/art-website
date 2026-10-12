import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [MetaController],
  providers: [MetaService],
  exports: [MetaService],
})
export class MetaModule {}