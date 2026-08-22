import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryResult, QueryResultRow } from 'pg';
import { DatabaseService } from '../database/database.service';
import { pagination } from '../common/database.util';
import { CreateOrderDto } from './order.dto';
import { RequestUser } from '../common/types/request-user.type';
type Variant = {
  id: string;
  product_id: string;
  name: string;
  price: string;
  sale_price: string | null;
  stock: number;
  is_active: boolean;
  product_name: string;
  product_active: boolean;
};
type SqlClient = { query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>> };
type Order = { id: string; user_id: string | null; status: string };
const transitions: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED'],
  PACKED: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};
@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}
  async create(dto: CreateOrderDto, user?: RequestUser) {
    const ids = dto.items.map((i) => i.variantId);
    if (new Set(ids).size !== ids.length)
      throw new BadRequestException({
        message: 'Each variant can appear only once',
        code: 'VALIDATION_ERROR',
      });
    return this.db.transaction(async (c) => {
      const vr = await c.query<Variant>(
        'select v.*,p.name product_name,p.is_active product_active from product_variants v join products p on p.id=v.product_id where v.id=any($1::uuid[]) for update',
        [ids],
      );
      if (vr.rows.length !== ids.length)
        throw new NotFoundException({
          message: 'A product variant was not found',
          code: 'VARIANT_NOT_FOUND',
        });
      const map = new Map(vr.rows.map((v) => [v.id, v]));
      let subtotal = 0;
      for (const i of dto.items) {
        const v = map.get(i.variantId)!;
        if (!v.is_active || !v.product_active)
          throw new BadRequestException({
            message: `Variant ${v.name} is unavailable`,
            code: 'VARIANT_NOT_FOUND',
          });
        if (v.stock < i.quantity)
          throw new BadRequestException({
            message: `Insufficient stock for ${v.product_name} ${v.name}`,
            code: 'INSUFFICIENT_STOCK',
          });
        subtotal += Number(v.sale_price ?? v.price) * i.quantity;
      }
      const sr = await c.query<{
        shipping_fee: string;
        free_shipping_threshold: string;
      }>(
        'select shipping_fee,free_shipping_threshold from store_settings limit 1',
      );
      if (!sr.rows[0])
        throw new BadRequestException({
          message: 'Store settings are not configured',
          code: 'SETTINGS_NOT_FOUND',
        });
      const shipping =
        subtotal >= Number(sr.rows[0].free_shipping_threshold)
          ? 0
          : Number(sr.rows[0].shipping_fee);
      const o = await c.query<{ id: string }>(
        'insert into orders(order_number,user_id,customer_name,customer_phone,customer_email,shipping_address,city,district,state,pincode,subtotal,shipping_fee,total) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id',
        [
          `RIYA-${Date.now()}`,
          user?.id ?? null,
          dto.customer.name,
          dto.customer.phone,
          dto.customer.email,
          dto.shippingAddress.addressLine,
          dto.shippingAddress.city,
          dto.shippingAddress.district,
          dto.shippingAddress.state,
          dto.shippingAddress.pincode,
          subtotal,
          shipping,
          subtotal + shipping,
        ],
      );
      for (const i of dto.items) {
        const v = map.get(i.variantId)!;
        const price = Number(v.sale_price ?? v.price);
        const stock = await c.query(
          'update product_variants set stock=stock-$1 where id=$2 and stock>=$1 returning id',
          [i.quantity, v.id],
        );
        if (!stock.rowCount)
          throw new BadRequestException({
            message: `Insufficient stock for ${v.product_name} ${v.name}`,
            code: 'INSUFFICIENT_STOCK',
          });
        await c.query(
          'insert into order_items(order_id,product_id,variant_id,product_name,variant_name,quantity,unit_price,total_price) values($1,$2,$3,$4,$5,$6,$7,$8)',
          [
            o.rows[0].id,
            v.product_id,
            v.id,
            v.product_name,
            v.name,
            i.quantity,
            price,
            price * i.quantity,
          ],
        );
      }
      await c.query(
        'insert into order_status_history(order_id,status,note,updated_by) values($1,$2,$3,$4)',
        [o.rows[0].id, 'PENDING', 'Order placed', user?.id ?? null],
      );
      return this.detailWith(c, o.rows[0].id, user, true);
    });
  }
  async listForUser(user: RequestUser) {
    return (
      await this.db.query(
        'select * from orders where user_id=$1 order by created_at desc',
        [user.id],
      )
    ).rows;
  }
  async detail(id: string, user?: RequestUser, admin = false) {
    return this.detailWith(this.db, id, user, admin);
  }
  private async detailWith(
    client: SqlClient,
    id: string,
    user?: RequestUser,
    admin = false,
  ) {
    const r = await client.query<Order & Record<string, unknown>>(
      'select * from orders where id=$1',
      [id],
    );
    const o = r.rows[0];
    if (!o)
      throw new NotFoundException({
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
      });
    if (!admin && o.user_id !== user?.id)
      throw new ForbiddenException({
        message: 'You cannot access this order',
        code: 'FORBIDDEN',
      });
    const [items, history] = await Promise.all([
      client.query('select * from order_items where order_id=$1', [id]),
      client.query(
        'select * from order_status_history where order_id=$1 order by created_at',
        [id],
      ),
    ]);
    return { ...o, items: items.rows, statusHistory: history.rows };
  }
  async cancel(id: string, user: RequestUser) {
    const o = (await this.detail(id, user)) as Order;
    if (!['PENDING', 'CONFIRMED'].includes(o.status))
      throw new BadRequestException({
        message: 'This order can no longer be cancelled',
        code: 'ORDER_CANNOT_BE_CANCELLED',
      });
    return this.changeStatus(
      id,
      'CANCELLED',
      'Cancelled by customer',
      user.id,
      true,
    );
  }
  async listAdmin(q: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const p = pagination(q.page, q.limit),
      v: unknown[] = [],
      f: string[] = [];
    if (q.status) {
      v.push(q.status);
      f.push(`status=$${v.length}`);
    }
    if (q.search) {
      v.push(`%${q.search}%`);
      f.push(
        `(order_number ilike $${v.length} or customer_name ilike $${v.length} or customer_phone ilike $${v.length})`,
      );
    }
    const w = f.length ? 'where ' + f.join(' and ') : '';
    const n = await this.db.query<{ count: string }>(
      `select count(*) from orders ${w}`,
      v,
    );
    v.push(p.limit, p.from);
    const rows = await this.db.query(
      `select * from orders ${w} order by created_at desc limit $${v.length - 1} offset $${v.length}`,
      v,
    );
    return {
      items: rows.rows,
      pagination: {
        page: p.page,
        limit: p.limit,
        total: +n.rows[0].count,
        totalPages: Math.ceil(+n.rows[0].count / p.limit),
      },
    };
  }
  async changeStatus(
    id: string,
    status: string,
    note: string,
    updatedBy?: string,
    bypass = false,
  ) {
    const o = (
      await this.db.query<Order>('select * from orders where id=$1', [id])
    ).rows[0];
    if (!o)
      throw new NotFoundException({
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
      });
    if (
      ['DELIVERED', 'CANCELLED'].includes(o.status) ||
      (!bypass && !transitions[o.status]?.includes(status))
    )
      throw new BadRequestException({
        message: `Cannot move an order from ${o.status} to ${status}`,
        code: 'INVALID_ORDER_STATUS',
      });
    await this.db.transaction(async (c) => {
      await c.query('update orders set status=$2 where id=$1', [id, status]);
      await c.query(
        'insert into order_status_history(order_id,status,note,updated_by) values($1,$2,$3,$4)',
        [id, status, note, updatedBy ?? null],
      );
    });
    return this.detail(id, undefined, true);
  }
}
