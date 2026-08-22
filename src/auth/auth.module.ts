import { Global, Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';
import { OptionalAuthGuard } from './optional-auth.guard';

@Global()
@Module({
  providers: [AuthGuard, AdminGuard, OptionalAuthGuard],
  exports: [AuthGuard, AdminGuard, OptionalAuthGuard],
})
export class AuthModule {}
