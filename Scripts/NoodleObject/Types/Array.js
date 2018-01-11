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
    }
};