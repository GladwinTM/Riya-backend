import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
export class SettingsDto {
  @IsOptional() @IsString() storeName?: string;
  @IsOptional() @IsString() @Matches(/^[A-Z]{3}$/) currency?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) shippingFee?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  freeShippingThreshold?: number;
  @IsOptional() @IsString() supportPhone?: string;
  @IsOptional() @IsEmail() supportEmail?: string;
}
