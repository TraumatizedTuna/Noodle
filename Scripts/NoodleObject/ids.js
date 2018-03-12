noodle.ids = {
    //Lists describing free ids
    freeList: [0],
    objsById: {},

    add(obj) {
        //var objNoodle = noodle.expr.eval(noodle, obj.noodleExp) || noodle; //TODO: Kinda ugly
        noodle.ids.objsById[obj.id] = obj;
    },

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
            if (val.meta !== undefined) {
                //If there's no id, add one
                if (val.meta.id === undefined) {
                    val.meta.id = noodle.ids.firstFree();
                    noodle.ids.add(val);
                    hadId = false;
                }
                id = val.meta.id;
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
    }
};