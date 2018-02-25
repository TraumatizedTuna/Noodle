noodle.any = new class extends Object {
    random(args) {
        var noodle = args.noodle;
        var types = args.types || ['object', 'array', 'string', 'number'];

        var type = types[Math.floor(Math.random() * types.length)];
        return noodle[type].random(args);
    }
    getType(args) {
        var noodle = args.noodle;
        var obj = args.obj;

        if (obj && (typeof obj === 'object' || typeof obj === 'function')) {
            return { type: obj.type || typeof obj };
        }

        return { type: typeof obj };
    }
    hasAnyType(args) {
        var noodle = args.noodle;
        var val = args.val;
        var types = args.types;

        var type;

        if (val && (typeof val === 'object' || typeof val === 'function')) {
            type = val.type;
            if (types.indexof(type) !== -1)
                return { hasType: true, type: type };
        }

        type = typeof val;
        if (types.indexof(type) !== -1)
            return { hasType: true, type: type };

        return { hasType: types.indexof('any') !== -1, type: 'any' };

    }
    propByType(args) {
        var noodle = args.noodle;
        var obj = args.obj;
        var key = args.key;
        var errIfAny = args.errIfAny;

        var type;
        var propPar;
        var prop;

        if (obj && (typeof obj === 'object' || typeof obj === 'function')) {
            type = obj.type;
            propPar = noodle[type];
        }
        if (propPar) {
            prop = propPar[type];
        }
        if (!prop) {
            type = typeof obj;
            propPar = noodle[type];
            if (propPar)
                prop = propPar[key];
            if (!prop) {
                if (typeof obj !== 'object' && typeof obj !== 'function') {
                    type = 'prim';
                    prop = noodle.prim[key];
                }
                if (!prop) {
                    type = 'any';
                    prop = noodle.any[key];
                    if (errIfAny) {
                        throw 'error thingy: Had to use "any" as type for ' + obj + '\nkey: ' + key;
                    }
                }
            }
        }
        //console.log(obj);
        return { prop: prop, type: type }; //TODO? Rename type to usefulType or something?
    }
    serialize(args) {
        var noodle = args.noodle;
        var val = args.val;
        var idMap = args.idMap = args.idMap || {};
        /*
        if (val.type === 'wire') {
            var a = 'aap';
        }*//*
        var { prop: serialize, type: type } = noodle.any.propByType({
            noodle: noodle,
            val: val,
            key: 'serialize',
            errIfAny: true
        });*/

        var type = typeof val;
        //if (type === 'any') {
        if (['null', 'undefined', 'number', 'symbol'].indexOf(type) !== -1) {
            var constrName = type.substr(0, 1).toUpperCase() + type.substr(1);
            return {
                serialized: {
                    serType: constrName,
                    //constr: eval(constrName),
                    val: args.val,
                    idMap: args.idMap || {}
                }
            };
        }

        return val.serialize(args);//{ serialized: serialize(args).serialized, idMap: idMap }; //TODO? Is this shallow cloning stupid? Should idMap come from serialize?
    }
    toDataStr(args) {
        var noodle = args.noodle;
        var obj = args.obj;
        var serialized = args.serialized;

        if (serialized !== undefined && serialized.serType === 'id') {
            return { str: 'id(' + serialized.val + ')' };
        }

        var toDataStr = noodle.any.propByType({
            noodle: noodle,
            obj: obj,
            key: 'toDataStr'
        }).prop;

        return { str: toDataStr(args).str };
    }
    reduceErrVal(args) {
        var errVal = args.errVal;

        return noodle.any.propByType({
            noodle: noodle,
            obj: errVal,
            key: 'reduceErrVal'
        }).prop(args);

    }
}();