import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsDefined,
  IsNotEmptyObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaveStructDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsNumber()
  public created: number;

  @IsNumber()
  public edited: number;

  @IsNumber()
  public count: number;

  @IsNumber()
  public id: number;

  @IsArray()
  @IsNotEmpty()
  public list: Array<string>;
}

export class BlobDto {
  @IsDefined()
  @IsNotEmptyObject()
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SaveStructDto)
  public dat: Array<SaveStructDto>;
}
