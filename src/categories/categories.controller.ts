import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategoryDto, UpdateCategoryDto } from './category.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}
  @Get() list() {
    return this.service.list();
  }
}
@ApiTags('Admin Categories')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly service: CategoriesService) {}
  @Get() list() {
    return this.service.list(true);
  }
  @Post() create(@Body() dto: CategoryDto) {
    return this.service.create(dto);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
