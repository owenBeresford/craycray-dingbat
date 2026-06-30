/*
- Make a relevent type file
- Make NamedClass trait/ interface, + BaseClass
   - Single inheritence as TS 
   - can use abstract for base class
- Add a new ancestor to all the clases with debugSymbol

*/
export abstract class AbstractSelfNameClass {
    protected static _debugSymbol = Symbol("DEFINE ME");

    public static get debugSymbol():Symbol {
     return this._debugSymbol;
    }

}
