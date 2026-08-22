import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { RequestUser } from '../common/types/request-user.type';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    if (!request.user)
      throw new ForbiddenException({
        message: 'Admin access is required',
        code: 'FORBIDDEN',
      });
    const { rows } = await this.db.query<{ role: string }>(
      'select role from profiles where user_id = $1',
      [request.user.id],
    );
    if (rows[0]?.role !== 'ADMIN')
      throw new ForbiddenException({
        message: 'Admin access is required',
        code: 'FORBIDDEN',
      });
    request.user.role = 'ADMIN';
    return true;
  }
}
