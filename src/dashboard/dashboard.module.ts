import { Controller, Get, Injectable, Module, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DatabaseService } from '../database/database.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}
  async stats() {
    const r = await this.db.query<{
      status: string;
      total: string;
      created_at: Date;
    }>(
      "select status,total,created_at from orders where status <> 'CANCELLED'",
    );
    const day = new Map<string, number>();
    for (const o of r.rows) {
      const d = o.created_at.toISOString().slice(0, 10);
      day.set(d, (day.get(d) ?? 0) + Number(o.total));
    }
    return {
      totalOrders: r.rows.length,
      totalSales: r.rows.reduce((n, o) => n + Number(o.total), 0),
      pendingOrders: r.rows.filter((o) => o.status === 'PENDING').length,
      deliveredOrders: r.rows.filter((o) => o.status === 'DELIVERED').length,
      salesByDate: [...day].map(([date, sales]) => ({ date, sales })),
    };
  }
}
@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly s: DashboardService) {}
  @Get('stats') stats() {
    return this.s.stats();
  }
}
@Module({ providers: [DashboardService], controllers: [DashboardController] })
export class DashboardModule {}
