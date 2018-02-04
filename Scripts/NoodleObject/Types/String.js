noodle.string = {
    //Removes amount chars at end of str
    trimEnd(str, amount) {
        return str.substr(0, str.length - amount);
    },

    random(args) {
        var noodle = args.noodle;
        var contProb = args.contProb || 0.7;

        var str = '';
        var chars = 'abcdefghijklmnopqrstuvwxyzåäöABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ0123456789§½!"#¤%&/()=+?´`@£${[]}\¨^~' + "'" + '*<>|,;.:-_';
        while (Math.random() < contProb) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    },
    serialize(args) {
        return {
            serialized: {
                serType: 'string',
                val: args.obj,
                obj: args.obj,
                idMap: args.idMap || {}
            }
        };
    },
    toDataStr(args) {
        var obj = args.obj;
        return { str: 'string' + obj.length + '|' + obj };
    },
    reduceErrVal(args) {
        var noodle = args.noodle;
        var func = args.func;
        var key = args.key;
        var testArgs = args.testArgs || {};
        var types = args.randArgs.types;
        var errVal = args.errVal;

        while (errVal.length > 0) {
            errVal = errVal.substr(0, errVal.length - 1);
            testArgs[key] = errVal;
            try {
                func(testArgs);
                errVal = args.errVal.substr(0, errVal.length + 1);
                break;
            }
            catch (e) {
                args.error = e;
            }
        }

        args.errVal = errVal;
        return args;
    }
};