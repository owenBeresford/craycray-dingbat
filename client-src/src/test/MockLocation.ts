import type { DOMStringList } from "../types/infill-DOM-types-for-tests";

if(typeof URLSearchParams == 'undefined') {
	throw new Error("Please update your version of Node.  URLSearchParams should exist with no shims.");
}


export interface MockLocation {
ancestorOrigins:DOMStringList;
hash:string;
host:string;
hostname:string;
href:string;
origin:string;
pathname:string;
port:string;
protocol:string;
search: string;

assign: (url: string | URL) => void;
reload:LocationCB;
replace:(url: string | URL) => void;
toString:()=>string;
valueOf: ()=>MockLocation;
compare(b:TestLocation):boolean;
}

type LocationCB=null | ((a:any)=>void);

export class TestLocation implements MockLocation {
ancestorOrigins:DOMStringList ={} as DOMStringList;
hash:string="";
host:string="";
hostname:string= "";
href:string= "";
origin:string="";
pathname:string="";
port:string="";
protocol:string="";
search:string="";
// search: URLSearchParams=new URLSearchParams("");

constructor(a:string|URL) {
	try {
	let t=new URL(a);
	this.hash=t.hash;
	this.host=t.host;
	this.hostname=t.hostname;
	this.href=t.href;
	this.origin=t.origin;
	this.pathname=t.pathname;
	this.port=t.port;
	this.protocol=t.protocol;
	this.search=t.search;
	} catch(e) { }
}

// these two dont make sense in this Mock/ test.
assign: (url: string | URL) => void = (a:string|URL):void =>{};
reload:() => void = ():void =>{};
// This class doesn't interact with any DOM, 
// this does return a new object with the correct state, as best fake choice
replace: (url: string | URL) => void =(a: string | URL):void => {};

// huh?
toString():string { return `<TestLocation value='${this.href}' />`; }  

// huh?
valueOf():MockLocation { return this; }

compare(b:TestLocation):boolean {
	return this.toString() === b.toString();
}
}
