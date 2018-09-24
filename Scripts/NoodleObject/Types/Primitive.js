noodle.prim = new class extends noodle.any.constructor {
    _toSerial(args) {
        var val = args.val;
        return {
            serialized: {
                serType: typeof val,
                val: val,
                obj: val,
                idMap: args.idMap || {}
            }
        };
    }
    _toDataStr(args) {
        var val = args.val;
        var str = val + '';
        var constrName;
        try {
            constrName = val.constructor.name;
        }
        catch (e) {}
        if (!constrName) {
            constrName = typeof val;
            constrName = constrName[0].toUpperCase() + constrName.substr(1);
        }
        return { str: constrName + str.length + '|' + str };
    }
    _fromDataStr(args) {
        args.idMap = args.idMap || {};
        var { noodle: noodle, str: str, val, constr: constr, idMap: idMap } = args;
        val = "";

        //Example: str == "5|hellob:Number(7)y:Boolean1|"
        var i = str.indexOf('|'); //i == 1
        var length = parseInt(str.substr(0, i)); //length == 5

        str = str.substr(i + 1); //str == "hellob:Number(7)y:Boolean1|"
        val = new constr(str.substr(0, length)).valueOf();
        return { val: val, strRest: str.substr(length) };

    }
}();




noodle.Prim = {
    toSerial(args = {}) {
        args.val = args.val || this;
        args.noodle = args.noodle || args.val.noodle;
        return noodle.prim._toSerial(args);
    }
};


class Prim{
    constructor(args) {
    }
    toSerial(args) {
        args.val = args.val || this;
        args.noodle = args.noodle || args.val.noodle || noodle;

        return noodle.prim._toSerial(args);
    }
    toDataStr(args = {}) {
        args.val = this;
        args.noodle = args.noodle || args.val.noodle || noodle;

        return noodle.prim._toDataStr(args);
    }
}
//Prim.prototype.__proto__ = Any.prototype;

Object.defineProperties(Prim, {
    fromDataStr: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args) {
            return args.noodle.prim._fromDataStr(args);
        }
    }
});

