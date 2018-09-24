noodle.ids = {
    //Lists describing free ids
    freeList: [0],
    objsById: {},

    add(obj) {
        //var objNoodle = noodle.expr.eval(noodle, obj.noodleExp) || noodle; //TODO: Kinda ugly
        if (obj.meta && obj.meta.id !== undefined)
            noodle.ids.objsById[obj.meta.id] = obj;
    },

    //TODO: Remove id from ids if it couldn't be added
    addIfAbsent(args) {
        var noodle = args.noodle;
        var val = args.val;

        var id;
        var hadId = true;
        var hasId = true;
        //If val is non-null object or function
        if ((typeof val === 'object' && val !== null) || typeof val === 'function') {
            if (val.meta === undefined) {
                try {
                    Object.defineProperty(val, 'meta', { enumerable: false, writable: true, configurable: true, value: {} });
                }
                catch (e) {
                    e.message += '\n\nval: ' + val;
                    //throw e;
                    val.meta = {};
                }
            }
            if (typeof val.meta === 'object') {
                //If there's no id, add one
                if (val.meta.id === undefined) {
                    val.meta.id = id = noodle.ids.firstFree();
                    noodle.ids.add(val);
                    hadId = false;
                }
                //If id still isn't there, let's accept that it can't be added   //TODO: Remove meta somewhere? Maybeee?
                if (val.meta.id === undefined) {
                    hasId = false;
                }
                else {
                    id = val.meta.id;
                }
            }
            //If meta couldn't be added to val
            else {
                id = noodle.ids.firstFree();
                hadId = hasId = false;
            }
        }
        else {
            id = noodle.ids.firstFree();
            hadId = hasId = false;
        }

        return { val: val, id: id, hasId: hasId, hadId: hadId };
    },

    //Gives you a free id from ids
    firstFree(ids = noodle.ids.freeList) {
        if (ids.length > 1) {
            return ids.pop();
        }
        var ind = ids.length - 1;
        var id = ids[ind];
        ids[ind]++;
        return id;
    },

    //Adds id to ids so it can be recycled. If safe, warns if you try to forget free id
    forget(ids, id, safe) {
        if (safe) {
            for (var i = 0; i < ids.length; i++) {
                if (ids[i] == id) {
                    console.warn("noodle.ids.forget() was called with " + id + ", which was already free. Something weird is going on.");
                    return;
                }
            }
        }

        if (id == ids[0] - 1)
            ids[0]--;
        else {
            ids.push(id);
        }
    },

    _fromDataStr(args) {
        var { noodle: noodle, str: str, idMap: idMap } = args;

        //Example: str == "(42)b:Number(7)"
        var i = str.indexOf('|', 1); //i == 3
        var id = str.substring(0, i); //id == "42"
        var strRest = str.substr(i + 1); //strRest == b:Number(7)

        return { noodle: noodle, val: idMap[id], strRest: strRest };
    }
};

class Id extends Object {
}

Id.fromDataStr = function (args) {
    return noodle.ids._fromDataStr(args);
}