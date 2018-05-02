noodle.undefined = new class extends noodle.prim.constructor{
    random(args) {
        return undefined;
    }
    _toSerial(args) {
        return {
            serialized: {
                serType: 'undefined',
                obj: 'undefined',
                idMap: args.idMap || {}
            }
        };
    }
    _toDataStr(args) {
        return { noodle: args.noodle, str: 'Undefined0' };
    }
} ();

class Undefined extends Prim {
    constructor(args) {
        super(args);
    }
}