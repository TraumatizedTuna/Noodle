noodle.any = {
    random(args) {
        var noodle = args.noodle;
        var types = args.types || ['object', 'array', 'string', 'number'];

        var type = types[Math.floor(Math.random() * types.length)];
        return noodle[type].random(args);
    },
    propByType(args) {
        var noodle = args.noodle;
        var obj = args.obj;
        var key = args.key;

        var type;
        var propPar;
        var prop;

        if (obj) {
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
                type = 'any';
                prop = noodle.any[key];
            }
        }

        return { prop: prop, type: type }; //TODO? Rename type to usefulType or something?
    },
    serialize(args) {
        var noodle = args.noodle;
        var obj = args.obj;
        var idMap = args.idMap = args.idMap || {};
        /*
        if (obj.type === 'wire') {
            var a = 'aap';
        }*/
        var serialize = noodle.any.propByType({
            noodle: noodle,
            obj: obj,
            key: 'serialize'
        }).prop;

        return { serialized: serialize(args).serialized, idMap: idMap }; //TODO? Is this shallow cloning stupid? Should idMap come from serialize?
    },
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
}