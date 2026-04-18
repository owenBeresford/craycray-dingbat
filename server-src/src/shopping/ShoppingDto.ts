import {
  //  ArrayMinSize,
  IsArray,
  //  IsBoolean,
  IsNotEmpty,
  IsNumber,
  //  IsOptional,
  IsString,
  ValidateNested,
  IsDefined,
  IsNotEmptyObject,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * SaveStructDto
 * A motionless accessible entity.  Here as class-validator config instance

 * @public
 */
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

/**
 * BlobDto
 * A motionless accessible entity.  Here as class-validator config instance

 * @public
 */
export class BlobDto {
  @IsDefined()
  @IsNotEmptyObject()
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SaveStructDto)
  public dat: Array<SaveStructDto>;
}
