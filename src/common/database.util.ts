import { InternalServerErrorException } from '@nestjs/common';

export function assertDb(
  error: { message: string } | null,
  fallback = 'Database request failed',
): void {
  if (error)
    throw new InternalServerErrorException({
      message: fallback,
      code: 'DATABASE_ERROR',
    });
}

export function pagination(page = 1, limit = 20) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  return {
    page: safePage,
    limit: safeLimit,
    from: (safePage - 1) * safeLimit,
    to: safePage * safeLimit - 1,
  };
}
