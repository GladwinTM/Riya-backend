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
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { DatabaseService } from '../database/database.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
export class ContactDto {
  @IsOptional() @IsString() businessName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() googleMapsUrl?: string;
  @IsOptional() @IsString() instagramUrl?: string;
  @IsOptional() @IsString() facebookUrl?: string;
  @IsOptional() @IsString() businessHours?: string;
}
@Injectable()
export class ContentService {
  constructor(private readonly db: DatabaseService) {}
  async get() {
    const r = await this.db.query('select * from contact_settings limit 1');
    if (!r.rows[0])
      throw new NotFoundException({
        message: 'Contact settings not found',
        code: 'CONTACT_NOT_FOUND',
      });
    return r.rows[0];
  }
  async update(d: ContactDto) {
    const x: any = await this.get();
    const r = await this.db.query(
      'update contact_settings set business_name=coalesce($2,business_name),phone=coalesce($3,phone),email=coalesce($4,email),whatsapp=coalesce($5,whatsapp),address=coalesce($6,address),google_maps_url=coalesce($7,google_maps_url),instagram_url=coalesce($8,instagram_url),facebook_url=coalesce($9,facebook_url),business_hours=coalesce($10,business_hours) where id=$1 returning *',
      [
        x.id,
        d.businessName ?? null,
        d.phone ?? null,
        d.email ?? null,
        d.whatsapp ?? null,
        d.address ?? null,
        d.googleMapsUrl ?? null,
        d.instagramUrl ?? null,
        d.facebookUrl ?? null,
        d.businessHours ?? null,
      ],
    );
    return r.rows[0];
  }
}
@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly s: ContentService) {}
  @Get('contact') get() {
    return this.s.get();
  }
}
@ApiTags('Admin Content')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/content')
export class AdminContentController {
  constructor(private readonly s: ContentService) {}
  @Get('contact') get() {
    return this.s.get();
  }
  @Patch('contact') update(@Body() d: ContactDto) {
    return this.s.update(d);
  }
}
@Module({
  providers: [ContentService],
  controllers: [ContentController, AdminContentController],
})
export class ContentModule {}
