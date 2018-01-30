noodle.number = {
    random(args) {
        var noodle = args.noodle;
        var contprob = args.contProb || 0.8;

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
                val: args.obj,
                obj: args.obj,
                idMap: args.idMap || {}
            }
        };
    },
    toDataStr(args) {
        var obj = args.obj;
        return { str: 'number(' + obj + ')' };
    }
}