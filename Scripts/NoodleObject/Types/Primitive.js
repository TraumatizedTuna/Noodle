noodle.prim = {
    serialize(args) {
        var val = args.obj;
        return {
            serialized: {
                serType: typeof val,
                val: val,
                obj: val,
                idMap: args.idMap || {}
            }
        };
    },
    toDataStr(args) {
        var val = args.obj;
        var str = val.toString;
        return { str: 'string' + str.length + '|' + str };
    }
}