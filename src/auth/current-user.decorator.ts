import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../common/types/request-user.type';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): RequestUser | undefined =>
    context.switchToHttp().getRequest<{ user?: RequestUser }>().user,
);
