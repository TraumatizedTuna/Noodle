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
        /*if (val === undefined) {
            var same = true;
            for (var i in args) {
                if (args[i] !== oldArgs[i]) {
                    same = false;
                    break;
                }
            }
            console.log(same);
            oldArgs = args;
        }*/
        var type = typeof val;
        if (type === undefined)
            type = 'undefined';
        //if (type === 'any') {
        if (['undefined', 'number', 'symbol'].indexOf(type) !== -1 || val === null || !val.serialize) {
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
        if (val === this)
            return noodle.object.serialize(args);
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
    callFunc(args) {
        var { noodle: noodle, val: val, funcName: funcName, args: subArgs } = args;

        var type = typeof val;
        if (type === undefined)
            type = 'undefined';
        if (['undefined', 'number', 'symbol'].indexOf(type) !== -1 || val === null || !val[funcName]) {
            //var constrName = type.substr(0, 1).toUpperCase() + type.substr(1);
            if (noodle[type] && noodle[type][funcName]) {
                return noodle[type][funcName](subArgs);
            }
            if (noodle.prim[funcName]) {
                return noodle.prim[funcName](subArgs);
            }
            if (noodle.any[funcName]) {
                return noodle.any[funcName](subArgs);
            }
            throw new TypeError("Cannot find function '" + funcName + "' for type '" + type + "' in noodle object with id " + noodle.meta.id);
        }
        return val[funcName](subArgs);
    }
}();

var oldArgs = {};