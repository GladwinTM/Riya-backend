import {
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DatabaseService } from '../database/database.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
@Injectable()
export class AdminService {
  constructor(private readonly db: DatabaseService) {}
  async customers() {
    return (
      await this.db.query(
        "select * from profiles where role='CUSTOMER' order by created_at desc",
      )
    ).rows;
  }
  async customer(id: string) {
    const r = await this.db.query('select * from profiles where user_id=$1', [
      id,
    ]);
    if (!r.rows[0])
      throw new NotFoundException({
        message: 'Customer not found',
        code: 'NOT_FOUND',
      });
    return r.rows[0];
  }
  async customerOrders(id: string) {
    await this.customer(id);
    return (
      await this.db.query(
        'select * from orders where user_id=$1 order by created_at desc',
        [id],
      )
    ).rows;
  }
}
@ApiTags('Admin Customers')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/customers')
export class AdminController {
  constructor(private readonly s: AdminService) {}
  @Get() customers() {
    return this.s.customers();
  }
  @Get(':id') customer(@Param('id') id: string) {
    return this.s.customer(id);
  }
  @Get(':id/orders') orders(@Param('id') id: string) {
    return this.s.customerOrders(id);
  }
}
@Module({ providers: [AdminService], controllers: [AdminController] })
export class AdminModule {}
