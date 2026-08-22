import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from '../database/database.service';
import { RequestUser } from '../common/types/request-user.type';

/** Attaches a user for endpoints that accept both guests and signed-in customers. */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ')
      ? header.slice(7)
      : request.cookies?.access_token;
    if (!token) return true;
    const { rows } = await this.db.query<{ user_id: string; email: string }>(
      'select user_id, email from profiles where user_id = $1',
      [token],
    );
    if (!rows[0])
      throw new UnauthorizedException({
        message: 'Use a local demo user UUID as the Bearer token',
        code: 'UNAUTHORIZED',
      });
    request.user = { id: rows[0].user_id, email: rows[0].email };
    return true;
  }
}
