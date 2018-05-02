noodle.string = new class extends noodle.prim.constructor {
    //Removes amount chars at end of str
    trimEnd(str, amount) {
        return str.substr(0, str.length - amount);
    }

    random(args) {
        var noodle = args.noodle;
        var contProb = args.contProb || 0.7;

        var str = '';
        var chars = 'abcdefghijklmnopqrstuvwxyzåäöABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ0123456789§½!"#¤%&/()=+?´`@£${[]}\¨^~' + "'" + '*<>|,;.:-_';
        while (Math.random() < contProb) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    }
    _toSerial(args) {
        return {
            serialized: {
                serType: 'string',
                val: args.val,
                obj: args.val,
                idMap: args.idMap || {}
            }
        };
    }
    _toDataStr(args) {
        var val = args.val;
        return { str: 'String' + val.length + '|' + val, noodle: args.noodle };
    }
    _fromDataStr(args) {
        args.idMap = args.idMap || {};
        var { noodle: noodle, str: str, val, constr: constr, idMap: idMap } = args;
        val = "";

        //Example: str == "5|hellob:Number(7)y:Boolean1|"
        var i = str.indexOf('|'); //i == 1
        var length = parseInt(str.substr(0, i)); //length == 5

        str = str.substr(i + 1); //str == "hellob:Number(7)y:Boolean1|"

        return { val: str.substr(0, length), strRest: str.substr(length) };

    }
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
}();

String.prototype.__proto__ = Prim.prototype;
String.__proto__ = Prim;

Object.defineProperties(String.prototype, {
    toDataStr: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args = {}) {
            args.val = this;
            args.noodle = args.noodle || args.val.noodle || noodle;

            return noodle.string._toDataStr(args);
        }
    }
});

Object.defineProperties(String, {
    fromDataStr: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args) {
            return args.noodle.string._fromDataStr(args);
        }
    }
})