import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
export class VariantDto {
  @IsString() name!: string;
  @Type(() => Number) @IsNumber() @Min(0.01) size!: number;
  @IsString() @Matches(/^(ml|L|g|kg)$/) unit!: string;
  @IsString() sku!: string;
  @Type(() => Number) @IsNumber() @Min(0) price!: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) salePrice?: number;
  @Type(() => Number) @IsInt() @Min(0) stock!: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class ProductDto {
  @IsString() @MaxLength(180) name!: string;
  @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug!: string;
  @IsString() description!: string;
  @IsString() shortDescription!: string;
  @IsString() @Matches(/^[0-9a-f-]{36}$/i) categoryId!: string;
  @IsOptional() @IsString() weight?: string;
  @IsOptional() @IsString() ingredients?: string;
  @IsOptional() @IsString() thumbnailUrl?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];
}

export class UpdateProductDto extends PartialType(ProductDto) {}
export class UpdateVariantDto extends PartialType(VariantDto) {}
