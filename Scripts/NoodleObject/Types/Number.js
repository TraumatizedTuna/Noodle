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
    serialize(args) {
        return {
            serialized: {
                serType: 'number',
                val: args.val,
                obj: args.val,
                idMap: args.idMap || {}
            }
        };
    },
    toDataStr(args) {
        var obj = args.obj;
        return { str: 'number(' + obj + ')' };
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
}