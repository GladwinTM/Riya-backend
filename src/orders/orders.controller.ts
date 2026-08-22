import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateStatusDto } from './order.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.type';
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}
  @Post() @UseGuards(OptionalAuthGuard) create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user?: RequestUser,
  ) {
    return this.service.create(dto, user);
  }
  @ApiBearerAuth() @UseGuards(AuthGuard) @Get() list(
    @CurrentUser() user: RequestUser,
  ) {
    return this.service.listForUser(user);
  }
  @ApiBearerAuth() @UseGuards(AuthGuard) @Get(':id') detail(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.service.detail(id, user);
  }
  @ApiBearerAuth() @UseGuards(AuthGuard) @Patch(':id/cancel') cancel(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.service.cancel(id, user);
  }
}
@ApiTags('Admin Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly service: OrdersService) {}
  @Get() list(
    @Query()
    q: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    return this.service.listAdmin(q);
  }
  @Get(':id') detail(@Param('id') id: string) {
    return this.service.detail(id, undefined, true);
  }
  @Patch(':id/status') update(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.service.changeStatus(id, dto.status, dto.note, user.id);
  }
}
