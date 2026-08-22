import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductDto, UpdateProductDto, UpdateVariantDto } from './product.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}
  @Get() list(
    @Query()
    query: {
      search?: string;
      category?: string;
      page?: number;
      limit?: number;
      sort?: string;
    },
  ) {
    return this.service.list(query);
  }
  @Get(':id') one(@Param('id') id: string) {
    return this.service.one(id);
  }
}
@ApiTags('Admin Products')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly service: ProductsService) {}
  @Get() list(@Query() q: { page?: number; limit?: number }) {
    return this.service.list(q, true);
  }
  @Post() create(@Body() dto: ProductDto) {
    return this.service.create(dto);
  }
  @Get(':id') one(@Param('id') id: string) {
    return this.service.one(id, true);
  }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
  @Patch('variants/:id') variant(
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.service.updateVariant(id, dto);
  }
}
