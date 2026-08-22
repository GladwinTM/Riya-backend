import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CategoryDto } from './category.dto';
type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
};
@Injectable()
export class CategoriesService {
  constructor(private readonly db: DatabaseService) {}
  async list(admin = false) {
    const r = await this.db.query<Category>(
      `select * from categories ${admin ? '' : 'where is_active=true'} order by name`,
    );
    return r.rows;
  }
  async create(d: CategoryDto) {
    const r = await this.db.query<Category>(
      'insert into categories(name,slug,description,image_url,is_active) values($1,$2,$3,$4,$5) returning *',
      [
        d.name,
        d.slug,
        d.description ?? null,
        d.imageUrl ?? null,
        d.isActive ?? true,
      ],
    );
    return r.rows[0];
  }
  async update(id: string, d: Partial<CategoryDto>) {
    const r = await this.db.query<Category>(
      'update categories set name=coalesce($2,name),slug=coalesce($3,slug),description=coalesce($4,description),image_url=coalesce($5,image_url),is_active=coalesce($6,is_active) where id=$1 returning *',
      [
        id,
        d.name ?? null,
        d.slug ?? null,
        d.description ?? null,
        d.imageUrl ?? null,
        d.isActive ?? null,
      ],
    );
    if (!r.rows[0])
      throw new NotFoundException({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
      });
    return r.rows[0];
  }
  async remove(id: string) {
    const r = await this.db.query('delete from categories where id=$1', [id]);
    if (!r.rowCount)
      throw new NotFoundException({
        message: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
      });
    return { id, deleted: true };
  }
}
