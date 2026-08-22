import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
export class OrderItemDto {
  @IsString() @Matches(/^[0-9a-f-]{36}$/i) variantId!: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) quantity!: number;
}
class CustomerDto {
  @IsString() @MaxLength(120) name!: string;
  @IsString() @Matches(/^\d{10,15}$/) phone!: string;
  @IsEmail() email!: string;
}
class AddressDto {
  @IsString() addressLine!: string;
  @IsString() city!: string;
  @IsString() district!: string;
  @IsString() state!: string;
  @IsString() @Matches(/^\d{6}$/) pincode!: string;
}
export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
  @ValidateNested() @Type(() => CustomerDto) customer!: CustomerDto;
  @ValidateNested() @Type(() => AddressDto) shippingAddress!: AddressDto;
}
export class UpdateStatusDto {
  @IsEnum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ] as const)
  status!: string;
  @IsString() note!: string;
}
