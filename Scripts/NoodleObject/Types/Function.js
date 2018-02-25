noodle.function = {
    serialize(args) {
        var noodle = args.noodle;
        var obj = args.obj;
        var idMap = args.idMap = args.idMap || {};


        var serialized;
        //Make sure obj has an id
        noodle.ids.addIfAbsent({ noodle: noodle, obj: obj });

        //If obj isn't in idMap, add it
        if (idMap[obj.meta.id] === undefined) {
            //TODO: Non-enumerable stuff
            serialized = { serType: 'function', val: {}, obj: obj };
            idMap[obj.meta.id] = serialized;
            for (var i in obj) {
                serialized.val[i] = noodle.any.serialize({ noodle: noodle, obj: obj[i], idMap: idMap }).serialized;
            }
        }
        //If obj is already in idMap, just add its id
        else {
            serialized = { serType: 'id', val: obj.meta.id, obj: obj };
        }

        return { serialized: serialized, idMap: idMap };
    },
    toDataStr(args) {
        //Vars from args{
        var noodle = args.noodle;
        //If the function has already been serialized and has an idMap, use those. Otherwise, serialize
        if (args.serialized && args.idMap) {
            var serialized = args.serialized;
            var idMap = args.idMap;
        }
        else
            var { serialized: serialized, idMap: idMap } = noodle.any.serialize(args);
        //}

        var str = '';
        var mainStr = serialized.obj.toString();
        mainStr = mainStr.substr(mainStr.indexOf('('));

        for (var i in serialized.val) {
            var child = serialized.val[i];
            str += i + ':' + noodle.any.toDataStr({
                noodle: noodle,
                obj: child.obj,
                serialized: child,
                idMap: idMap
            }).str;
        }
        str = 'function' + mainStr.length + mainStr + str.length + '|' + str;

        return { str: str };
    },
    findError(args) {
        var noodle = args.noodle;
        var func = args.func;
        var key = args.key;
        var testArgs = args.testArgs || {};
        var randArgs = args.randArgs || {};

        testArgs.noodle = randArgs.noodle || noodle;
        randArgs.noodle = randArgs.noodle || noodle;

        var errVal;
        while (true) {
            errVal = noodle.any.random(randArgs);
            testArgs[key] = errVal;
            try {
                func(testArgs)
            } catch (e) {
                return { errVal: errVal, error: e };
            }
        }
    },
    findSimpleError(args) {
        var noodle = args.noodle;
        var func = args.func;
        var key = args.key;
        var testArgs = args.testArgs = args.testArgs || {};
        var randArgs = args.randArgs = args.randArgs || {};

        if (args.errVal === undefined)
            args.errVal = noodle.function.findError(args).errVal;

        noodle.any.reduceErrVal(args);
        return args;
    }
}

Object.defineProperties(Function.prototype, {
    add: {
        enumerable: false,
        value: Object.add
    }
});