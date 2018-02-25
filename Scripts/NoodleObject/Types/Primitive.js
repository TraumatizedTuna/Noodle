noodle.prim = {
    serialize(args) {
        var val = args.val;
        return {
            serialized: {
                serType: typeof val,
                val: val,
                obj: val,
                idMap: args.idMap || {}
            }
        };
    },
    toDataStr(args) {
        var val = args.obj;
        var str = val.toString;
        return { str: 'string' + str.length + '|' + str };
    }
}

//TODO: This looks pretty ugly
noodle.constructor.defineProperty(
    noodle,
    'Prim',
    {
        set: function (p) {
            for (var c of [Boolean, Number, String, Symbol]) {
                for (var i in p) {
                    var prop = p[i];
                    Object.defineProperty(c.prototype, i, { value: prop, enumerable: false });
                }
            }
        },
        get: function () {
            return {};
        }
    }

);
noodle.Prim = {
    serialize(args = {}) {
        args.val = args.val || this;
        args.noodle = args.noodle || args.val.noodle;
        return noodle.prim.serialize(args);
    }
};


class Prim{
    constructor() {
        
    }
}