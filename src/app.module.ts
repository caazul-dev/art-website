import { Module } from '@nestjs/common';
import { MetaModule } from './meta/meta.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { axiomModule } from './axiom/axiom.module';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, axiomModule],
})
export class AppModule {}