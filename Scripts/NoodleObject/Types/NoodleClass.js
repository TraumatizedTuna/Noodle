class Noodle extends Object {
    constructor(args) {
        super();
    }
    toSerial(args) {
        return {
            serialized: {
                serType: 'noodle',
                val: this,
                idMap: args.idMap,
                id: 0 //TODO: Shouldn't be there
            }
        };
    }
    toDataStr(args) {
        return { str: 'Noodle0' };
    }
}

var noodle = new Noodle();




noodle.constructor.defineProperties(noodle, {
    name: {
        enumerable: false,
        writable: true,
        configurable: true,
        value: 'noodle'
    }
});


Noodle.defineProperties(Noodle, {
    fromDataStr: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args) {
            return args.noodle.noodle._fromDataStr(args);
        }
    }
});