import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { pagination } from '../common/database.util';
import { ProductDto, VariantDto } from './product.dto';
@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}
  async list(q: any, admin = false) {
    const p = pagination(q.page, q.limit),
      v: any[] = [],
      f: string[] = [];
    if (!admin) f.push('p.is_active=true');
    if (q.category) {
      v.push(q.category);
      f.push(`c.slug=$${v.length}`);
    }
    if (q.search) {
      v.push(`%${q.search}%`);
      f.push(`(p.name ilike $${v.length} or c.name ilike $${v.length})`);
    }
    const w = f.length ? 'where ' + f.join(' and ') : '';
    const n = await this.db.query<{ count: string }>(
      `select count(*) from products p join categories c on c.id=p.category_id ${w}`,
      v,
    );
    v.push(p.limit, p.from);
    const r = await this.db.query<any>(
      `select p.*,json_build_object('name',c.name,'slug',c.slug) categories,coalesce(json_agg(v.*)filter(where v.id is not null),'[]') product_variants from products p join categories c on c.id=p.category_id left join product_variants v on v.product_id=p.id ${w} group by p.id,c.name,c.slug order by p.created_at desc limit $${v.length - 1} offset $${v.length}`,
      v,
    );
    return {
      items: r.rows,
      pagination: {
        page: p.page,
        limit: p.limit,
        total: +n.rows[0].count,
        totalPages: Math.ceil(+n.rows[0].count / p.limit),
      },
    };
  }
  async one(id: string, admin = false) {
    const r = await this.db.query<any>(
      `select p.*,json_build_object('name',c.name,'slug',c.slug) categories,coalesce(json_agg(v.*)filter(where v.id is not null),'[]') product_variants from products p join categories c on c.id=p.category_id left join product_variants v on v.product_id=p.id where (p.id::text=$1 or p.slug=$1) ${admin ? '' : 'and p.is_active=true'} group by p.id,c.name,c.slug`,
      [id],
    );
    if (!r.rows[0])
      throw new NotFoundException({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
      });
    return r.rows[0];
  }
  async create(d: ProductDto) {
    const r = await this.db.query<{ id: string }>(
      'insert into products(name,slug,description,short_description,category_id,weight,ingredients,thumbnail_url,images,is_featured,is_active) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id',
      [
        d.name,
        d.slug,
        d.description,
        d.shortDescription,
        d.categoryId,
        d.weight,
        d.ingredients,
        d.thumbnailUrl,
        JSON.stringify(d.images ?? []),
        d.isFeatured ?? false,
        d.isActive ?? true,
      ],
    );
    for (const x of d.variants ?? []) await this.variant(r.rows[0].id, x);
    return this.one(r.rows[0].id, true);
  }
  async update(id: string, d: Partial<ProductDto>) {
    const old: any = await this.one(id, true);
    const x = { ...old, ...d };
    await this.db.query(
      'update products set name=$2,slug=$3,description=$4,short_description=$5,category_id=$6,weight=$7,ingredients=$8,thumbnail_url=$9,images=$10,is_featured=$11,is_active=$12 where id=$1',
      [
        id,
        x.name,
        x.slug,
        x.description,
        x.shortDescription,
        x.categoryId,
        x.weight,
        x.ingredients,
        x.thumbnailUrl,
        JSON.stringify(x.images ?? []),
        x.isFeatured,
        x.isActive,
      ],
    );
    if (d.variants) {
      await this.db.query('delete from product_variants where product_id=$1', [
        id,
      ]);
      for (const z of d.variants) await this.variant(id, z);
    }
    return this.one(id, true);
  }
  async remove(id: string) {
    const r = await this.db.query('delete from products where id=$1', [id]);
    if (!r.rowCount)
      throw new NotFoundException({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
      });
    return { id, deleted: true };
  }
  async updateVariant(id: string, d: Partial<VariantDto>) {
    const r = await this.db.query(
      'update product_variants set stock=coalesce($2,stock),price=coalesce($3,price),sale_price=coalesce($4,sale_price),is_active=coalesce($5,is_active) where id=$1 returning *',
      [id, d.stock, d.price, d.salePrice, d.isActive],
    );
    if (!r.rows[0])
      throw new NotFoundException({
        message: 'Variant not found',
        code: 'VARIANT_NOT_FOUND',
      });
    return r.rows[0];
  }
  private async variant(id: string, x: VariantDto) {
    await this.db.query(
      'insert into product_variants(product_id,name,size,unit,sku,price,sale_price,stock,is_active) values($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [
        id,
        x.name,
        x.size,
        x.unit,
        x.sku,
        x.price,
        x.salePrice ?? null,
        x.stock,
        x.isActive ?? true,
      ],
    );
  }
}
