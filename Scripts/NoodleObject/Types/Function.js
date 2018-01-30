noodle.function = {
    findError(args) {
        var noodle = args.noodle;
        var func = args.func;
        var key = args.key;
        var testArgs = args.testArgs || {};
        var randArgs = args.randArgs || {};

        testArgs.noodle = randArgs.noodle || noodle;
        randArgs.noodle = randArgs.noodle || noodle;

        var errVal;
        while (true) {
            try {
                errVal = noodle.any.random(randArgs);
                testArgs[key] = errVal;
                func(testArgs)
            } catch (e) {
                return {}
            }
        }
    },
    findSimpleError(args) {
        var noodle = args.noodle;
        var func = args.func;
        var key = args.key;
        var testArgs = args.testArgs || {};
        var randArgs = args.randArgs || {};

        var errVal = noodle.function.findError(args);

        noodle.any.propByType({
            noodle: noodle,
            obj: errVal,
            key: 'reduceError'
        }).prop;
    }
}