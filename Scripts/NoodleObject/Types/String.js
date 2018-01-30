noodle.string = {
    //Removes amount chars at end of str
    trimEnd(str, amount) {
        return str.substr(0, str.length - amount);
    },

    random(args) {
        var noodle = args.noodle;
        var contprob = args.contProb || 0.7;

        var str = '';
        var chars = 'abcdefghijklmnopqrstuvwxyzåäöABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ0123456789§½!"#¤%&/()=+?´`@£${[]}\¨^~'+"'"+'*<>|,;.:-_';
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
        return { str: 'string(' + obj + ')' };
    }
};