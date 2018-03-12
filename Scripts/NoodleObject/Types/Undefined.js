noodle.undefined = {
    random(args) {
        return undefined;
    },
    serialize(args) {
        return {
            serialized: {
                serType: 'undefined',
                obj: 'undefined',
                idMap: args.idMap || {}
            }
        };
    },
    toDataStr(args) {
        var obj = args.obj;
        return { str: 'undefined' };
    }
}