noodle.noodle = new class extends noodle.object.constructor {
    _toDataStr(args) {
        return args.serialized.val.toDataStr(args); //TODO
    }
    _fromDataStr(args) {
        return { noodle: noodle, val: noodle, strRest: args.str.substr(1) };
    }
}();