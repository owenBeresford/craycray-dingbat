import type { DOMStringList } from "../../../common/types/infill-DOM-types-for-tests";

if (typeof URLSearchParams == "undefined") {
  throw new Error("Please update your version of Node.  URLSearchParams should exist with no shims.");
}

export interface MockLocation {
  ancestorOrigins: DOMStringList;
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;

  assign: (url: string | URL) => void;
  reload: () => void;
  replace: (url: string | URL) => void;
  toString(): string;
  valueOf(): MockLocation;
  compare(b: TestLocation): boolean;
}

type LocationCB = null | ((a: string) => void);

export class TestLocation implements MockLocation {
  public ancestorOrigins: DOMStringList = {} as DOMStringList;
  public hash: string = "";
  public host: string = "";
  public hostname: string = "";
  public href: string = "";
  public origin: string = "";
  public pathname: string = "";
  public port: string = "";
  public protocol: string = "";
  public search: string = "";
  // search: URLSearchParams=new URLSearchParams("");

  public constructor(a: string | URL) {
    try {
      let t = new URL(a);
      this.hash = t.hash;
      this.host = t.host;
      this.hostname = t.hostname;
      this.href = t.href;
      this.origin = t.origin;
      this.pathname = t.pathname;
      this.port = t.port;
      this.protocol = t.protocol;
      this.search = t.search;
    } catch (e) {}
  }

  // these two dont make sense in this Mock/ test.
  assign: (url: string | URL) => void = (a: string | URL): void => {
    return;
  };
  reload: () => void = (): void => {
    return;
  };
  // This class doesn't interact with any DOM,
  // this does return a new object with the correct state, as best fake choice
  public replace: (url: string | URL) => void = (a: string | URL): void => {};

  // huh?
  public toString(): string {
    return `<TestLocation value='${this.href}' />`;
  }

  // huh?
  public valueOf(): MockLocation {
    return this as MockLocation;
  }

  public compare(b: TestLocation): boolean {
    return this.toString() === b.toString();
  }
}
