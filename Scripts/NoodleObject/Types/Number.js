noodle.number = {
    random(args) {
        var noodle = args.noodle;
        var contProb = args.contProb || 0.8;

        var num = 0;

        while (Math.random() < contProb) {
            num += Math.random();
        }
        return num;
    },
    _toSerial(args) {
        return {
            serialized: {
                serType: 'number',
                val: args.val,
                obj: args.val,
                idMap: args.idMap || {}
            }
        };
    },
    _toDataStr(args) {
        var obj = args.obj;
        args.str = 'Number' + args.val + '|';
        return args;
    },
    _fromDataStr(args) {
        args.idMap = args.idMap || {};
        var { noodle: noodle, str: str, val, constr: constr, idMap: idMap } = args;
        val = "";

        //Example: str == "42|b:Number7|y:Boolean1|"
        var i = str.indexOf('|'); //i == 1
        var val = parseInt(str.substr(0, i)); //val == 42

        str = str.substr(i + 1); //str == "b:Number7|y:Boolean1|"
        console.warn('num');
        return { val: val, strRest: str };

    },
    reduceErrVal(args) {
        var noodle = args.noodle;
        var func = args.func;
        var key = args.key;
        var testArgs = args.testArgs || {};
        var types = args.randArgs.types;
        var errVal = args.errVal;

        var min = 0;
        var max = errVal;
        var testVal;
        while (Math.abs(max - min) >= 0.5) {
            testArgs[key] = testVal = (min + max / 2);
            try {
                func(testArgs);
                min = testVal;
            }
            catch (e) {
                max = testVal;
                args.error = e;
            }
        }
        testArgs[key] = Math.round(testVal);
        try {
            func(testArgs);
            testArgs[key] = testVal;
            try {
                func(testArgs);
            }
            catch (e) {
                errVal = testArgs[key];
                args.error = e;
            }
        }
        catch (e) {
            errVal = testArgs[key];
            args.error = e;
        }

        testArgs[key] = Math.abs(testVal);
        try {
            func(testArgs);
        }
        catch (e) {
            errVal = testArgs[key];
            args.error = e;
        }

        args.errVal = errVal;
        return args;
    }
};

Number.prototype.__proto__ = Prim.prototype;

Object.defineProperties(Number.prototype, {
    toDataStr: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args = {}) {
            args.val = this;
            args.noodle = args.noodle || args.val.noodle || noodle;

            return noodle.number._toDataStr(args);
        }
    }
});

Object.defineProperties(Number, {
    fromDataStr: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args) {
            return args.noodle.number._fromDataStr(args);
        }
    }
});