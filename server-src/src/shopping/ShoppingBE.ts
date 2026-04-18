import { Controller, Res, Req, Header, Body, HttpCode, Param, Get, Post } from '@nestjs/common';
// import { GoneException } from '@nestjs/common/exceptions';
import { ParseArrayPipe } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
// import { Request, Response, NextFunction } from 'express';

// import type { SaveStruct } from '../../../common/types/SaveStruct';
import { ShoppingService } from './ShoppingService';
import { BlobDto, SaveStructDto } from './ShoppingDto';

/*
class ShoppingBE

This class is NOT DEMO code, its just a limited scope usage class
To make this a class that could be accessed from the internet, add security process,
and remove assumption that my code is the only API user

NB: as there is no webserver, its fine to store data files in the same directory.
The code doesn't provide a "download URL" outside of the REST API.
*/

@Controller('api')
export class ShoppingBE {
  constructor(private readonly impl: ShoppingService) {}

  @Get('/shared-state')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @Header('Content-Language', 'en-GB')
  @Header('Content-Type', 'application/json')
  @Header('Pragma', 'no-cache')
  async load(): Promise<string> {
    return this.impl.load();
  }

  @Post('/shared-state')
  @HttpCode(201)
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @Header('Content-Language', 'en-GB')
  @Header('Content-Type', 'application/json')
  @Header('Accept', 'application/json')
  @Header('Pragma', 'no-cache')
  // ParseArrayOptions
  async save(@Body(new ParseArrayPipe()) dat: Array<SaveStructDto>): Promise<string> {
    const left = dat as Array<SaveStructDto>;
    return this.impl.save(left);
  }
}
