import { GoneException } from '@nestjs/common/exceptions';
import fs from 'fs';
import { promises as FSP } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

import { SaveStruct } from '../../common/types/SaveStruct';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SOL_STORE_IMAGE = path.join(__dirname, 'list.json');

export class ShoppingService {
  private left: Array<SaveStruct>;
  private right: Array<SaveStruct>;

  constructor() {
    this.left = [];
    this.right = [];
  }

  public load(): Promise<string> {
    return new Promise((good, bad) => {
      fs.readFile(  SOL_STORE_IMAGE,
                    { encoding: 'utf8' },
                    ( err: NodeJS.ErrnoException | null, data: string) => {
        if (err) {
          console.warn('PANIC! Cannot read server store file ', err);
          bad(new GoneException());
          return;
        }
        return good(data);

                    });
    });
  }

  merge(left: Array<SaveStruct>, right: Array<SaveStruct>): Array<SaveStruct> {
    const out = [] as Array<SaveStruct>;
    const MAX = Math.max(left.length, right.length);

    for (let i = 0; i < MAX; i++) {
      if (i >= left.length) {
        out.push(right[i]);
        continue;
      }
      if (i >= right.length) {
        out.push(left[i]);
        continue;
      }

      if (left[i].edited > right[i].edited) {
        out.push(left[i]);
      } else {
        out.push(right[i]);
      }
    }
    return out;
  }

  actualSave(dat: Array<SaveStruct>): Promise<string> {
    const tmp = JSON.stringify(dat);
    // havent set the write mode, may not need to

    return new Promise((good, bad) => {
      fs.writeFile(SOL_STORE_IMAGE, tmp, (err: NodeJS.ErrnoException | null) => {
        if (err) {
          console.warn('PANIC! Cannot write server store file ', err);
          bad(new GoneException('ignore this JSON, use the HTTP code'));
        } else {
          good('{"result":"ignore this JSON, use the HTTP code", "statusCode":204}');
        }
      });
    });
  }

  inner(data: string): void {
    // I would like to say this is a specific type, but it could be a string "cabbage"
    let tt: Array<any> = [];

    try {
      tt = JSON.parse(data);
      if ( !Array.isArray(tt) ) {
        throw Error("JSON in storage isn't an array ");
      }
    } catch (e) {
      console.warn('PANIC! Cannot read server store file ', e);
      throw new GoneException('Malformed JSON in fle data');
    }
    if (this.right.length) {
      this.right.splice(0, this.right.length);
    } else {
      this.right = [];
    }
    try {
      this.right = this.typeAssert(tt);
    } catch (e) {
      throw new GoneException('Malformed JSON in fle data');
    }
  }

  typeAssert(newer: Array<any>): Array<SaveStruct> {
    const dat: Array<SaveStruct> = [];

    let FAIL = 0;
    for (let i = 0; i < newer.length; i++) {
      const ttt:SaveStruct = Object.assign(
                  { name: '', created: 0, edited: 0, count: 0, id: i, list: [] },
                   newer[i]) as SaveStruct;
      // all these items must have a value
      if (!(ttt.name && ttt.created && ttt.edited && ttt.count && ttt.id)) {
        console.log('Uploaded shopping list at ' + i + ' is missing critical data.');
        FAIL++;
      } else {
        dat.push(ttt);
      }
    }
    if (FAIL > 0) {
      throw new Error('Transactiomn rejected, invalid data supplied.');
    }
    return dat;
  }

  public async save(left: Array<SaveStruct>): Promise<string> {
    if (!Array.isArray(left)) {
      throw new Error('Malformed data as param ' + left);
    }

    this.left = this.typeAssert(left);
    const local = await FSP.open(SOL_STORE_IMAGE, 'r');
    return local
      .readFile({ encoding: 'utf8' })
      .then( this.inner.bind(this) )
      .then(() => {
        local.close();
        return this.actualSave(this.merge(this.left, this.right));
      });
  }
}
