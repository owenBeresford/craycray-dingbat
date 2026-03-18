
export function delay(ms:number ):Promise<number> { 
	return new Promise((good, bad) => setTimeout(good, ms) );
}