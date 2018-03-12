class Noodle extends Object {
    constructor(args) {
        super();
    }
    serialize(args) {
        return {
            serType: Noodle,
            val: this,
            idMap: args.idMap
        };
    }
}

var noodle = new Noodle();

noodle.constructor.defineProperty(noodle, 'name', { enumerable: false, writable: true, configurable: true, value: 'noodle' });