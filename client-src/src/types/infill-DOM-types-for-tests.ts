
export interface DOMStringList {
    readonly length: number;
 //   [Symbol(Symbol.toStringTag)]:Readonly<string>;
    
    [Symbol.iterator]: ()=>ArrayIterator<string>;
    contains(str: string): boolean;
    item(index: number): string | null;
    [index: number]: string;
 
}
