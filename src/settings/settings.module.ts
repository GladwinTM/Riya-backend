import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DatabaseService } from '../database/database.service';
import { SettingsDto } from './settings.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
@Injectable()
export class SettingsService {
  constructor(private readonly db: DatabaseService) {}
  async get() {
    const r = await this.db.query('select * from store_settings limit 1');
    if (!r.rows[0])
      throw new NotFoundException({
        message: 'Store settings not found',
        code: 'SETTINGS_NOT_FOUND',
      });
    return r.rows[0];
  }
  async update(d: SettingsDto) {
    const x: any = await this.get();
    const r = await this.db.query(
      'update store_settings set store_name=coalesce($2,store_name),currency=coalesce($3,currency),shipping_fee=coalesce($4,shipping_fee),free_shipping_threshold=coalesce($5,free_shipping_threshold),support_phone=coalesce($6,support_phone),support_email=coalesce($7,support_email) where id=$1 returning *',
      [
        x.id,
        d.storeName ?? null,
        d.currency ?? null,
        d.shippingFee ?? null,
        d.freeShippingThreshold ?? null,
        d.supportPhone ?? null,
        d.supportEmail ?? null,
      ],
    );
    return r.rows[0];
  }
}
@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly s: SettingsService) {}
  @Get() get() {
    return this.s.get();
  }
}
@ApiTags('Admin Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly s: SettingsService) {}
  @Get() get() {
    return this.s.get();
  }
  @Patch() update(@Body() d: SettingsDto) {
    return this.s.update(d);
  }
}
@Module({
  providers: [SettingsService],
  controllers: [SettingsController, AdminSettingsController],
})
export class SettingsModule {}
