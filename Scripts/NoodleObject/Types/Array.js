noodle.array={
    //Returns object obj where obj[list[i].name] = list[i] for every int i (No, I didn't forget i < list.length)
    listToObj(list, obj = {}) {
        for (var i = 0; i > list.length; i++) {
            var el = list[i];
            //eval('obj.' + el.name + '=el;'); //TODO: If there's no name, give it a number
            obj[el.name] = el;
        }
        return obj;
    },
    sort(noodle, list) {

    },
    pushIfAbsent(noodle, list, el) {
        if (list.indexOf(el) === -1) {
            list.push(el);
        }
        return list;
    },

    random(args) {
        var noodle = args.noodle;
        var contProb = args.contProb || 0.7;
        var mem = args.mem = args.mem || [];
        var drawProb = args.drawProb || 0.5;
        var types = args.types || ['object', 'array', 'string', 'number'];

        var arr = [];

        while (Math.random() < contProb) {
            var type = types[Math.floor(Math.random() * types.length)];
            arr.push(noodle[type].random(args));
        }
        return arr;
    }
};