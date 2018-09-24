noodle.function = {
    _toSerial(args) {
        var noodle = args.noodle;
        var val = args.val;
        var idMap = args.idMap = args.idMap || {};


        var serialized;
        //Make sure val has an id TODO: Can functions be readonly?
        var id = noodle.ids.addIfAbsent({ noodle: noodle, val: val }).id;

        //If val isn't in idMap, add it
        if (idMap[id] === undefined) {
            //TODO: Non-enumerable stuff
            serialized = { serType: 'function', obj: {}, val: val, id: id };
            idMap[val.meta.id] = serialized;
            for (var i in val) {
                serialized.obj[i] = noodle.any.toSerial({ noodle: noodle, val: val[i], idMap: idMap }).serialized;
            }
        }
        //If val is already in idMap, just add its id
        else {
            serialized = { serType: 'id', obj: val.meta.id, val: val, id: id };
        }

        return { serialized: serialized, idMap: idMap };
    },
    _toDataStr(args) {
        //Vars from args{
        var { noodle: noodle } = args;
        //If the function has already been serialized and has an idMap, use those. Otherwise, toSerial
        if (args.serialized && args.idMap) {
            var serialized = args.serialized;
            var idMap = args.idMap;
        }
        else
            var { serialized: serialized, idMap: idMap } = noodle.any.toSerial(args);
        //}

        if (serialized.val.isNative()) {
            try {
                eval('var a= ' + serialized.val.evalableName);
            }
            catch (e) {
                console.warn('evalableName "' + evalableName + '"' + " could not be evaled. If you know you'll be able to eval it when parse your data string it's fine.\n\nError: " + e);
            }
            var mainStr = '.' + serialized.val.evalableName;
        }
        else {
            var mainStr = serialized.val.toString(); //TODO? What if .toString is overridden?
            mainStr = mainStr.substr(mainStr.indexOf('('));
        }

        args.constr = { name: '' };
        args.serialized = serialized;
        args.idMap = idMap;
        str = 'Function' + mainStr.length + mainStr + noodle.object._toDataStr(args).str;

        return { str: str, idMap: idMap, noodle: noodle };
    },
    _fromDataStr(args) {
        args.idMap = args.idMap || {};
        var { noodle: noodle, str: str, val, constr: constr, idMap: idMap } = args;

        var i = str.search(/\D/g);
        var length = parseInt(str.substr(0, i));

        str = str.substr(i);
        args.str = str.substr(length)
        str = str.substr(0, length);

        //'.' in the beginning of the function content means it is native code
        if (str[0] === '.') {
            eval('args.val= ' + str.substr(1) + ';');
        }
        else {
            args.val = eval('function f' + str + ';f;');
        }

        return noodle.object._fromDataStr(args);
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
    },
    quickTest(args) {
        var { noodle: noodle, val: val, testArgs: testArgs, valConstr: valConstr, key: key } = args;
        testArgs = testArgs || { noodle: noodle };
        valConstr = valConstr || Object;

        var testVal = new valConstr();
        testArgs[key] = testVal;
        try {
            val(testArgs);
        }
        catch (e) {
            return { error: e, value: testVal };
        }

        testVal.a = 3;
        try {
            val(testArgs);
        }
        catch (e) {
            return { error: e, value: testVal };
        }

        testVal[0] = 42;
        try {
            val(testArgs);
        }
        catch (e) {
            return { error: e, value: testVal };
        }

        testVal.b = 'foty-two';
        try {
            val(testArgs);
        }
        catch (e) {
            return { error: e, value: testVal };
        }

        testVal.c = {};
        try {
            val(testArgs);
        }
        catch (e) {
            return { error: e, value: testVal };
        }

        testVal.d = [];

        testVal.c = testVal;
        try {
            val(testArgs);
        }
        catch (e) {
            return { error: e, value: testVal };
        }

        testVal.d.push(testVal);
        try {
            val(testArgs);
        }
        catch (e) {
            return { error: e, value: testVal };
        }

        testVal.e = { x: 42, y: testVal, z: [7] };
        testVal.e.z.push(testVal.e);
        try {
            val(testArgs);
        }
        catch (e) {
            return { error: e, value: testVal };
        }

    }
};

Object.defineProperties(Function.prototype, {
    quickTest: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args) {
            args.val = this;
            return args.noodle.function.quickTest(args);
        }
    },
    toDataStr: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args = {}) {
            args.val = this;
            args.noodle = args.noodle || args.val.noodle || noodle;

            return noodle.function._toDataStr(args);
        }
    },

    isNative: {
        enumerable: false,
        writable: true,
        configurable: true,
        value() {
            //Modified code from Yong's answer at https://stackoverflow.com/questions/6598945/detect-if-function-is-native-to-browser?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

            return !!this
                && (this === Function.prototype
                    || /^\s*function\s*(\b[a-z$_][a-z0-9$_]*\b)*\s*\((|([a-z$_][a-z0-9$_]*)(\s*,[a-z$_][a-z0-9$_]*)*)\)\s*{\s*\[native code\]\s*}\s*$/i.test(String(this)));
        }
    }
});
/*
Object.defineProperties(Function, {
    defineProperty: {
        enumerable: false,
        writable: true,
        configurable: true,
        value: Object.defineProperty
    },
    defineProperties: {
        enumerable: false,
        writable: true,
        configurable: true,
        value: Object.defineProperties
    },
    getOwnPropertyDescriptor: {
        enumerable: false,
        writable: true,
        configurable: true,
        value: Object.getOwnPropertyDescriptor
    }
});
*/
Function.__proto__ = Object;

Object.defineProperties(Function, {
    fromDataStr: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args) {
            return args.noodle.function._fromDataStr(args);
        }
    }
});