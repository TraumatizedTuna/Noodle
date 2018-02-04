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
        var obj = args.obj;

        var hadId = true;
        if ((typeof obj === 'object' && obj !== null) || typeof obj === 'function') {
            if (obj.meta === undefined) {
                try {
                    Object.defineProperty(obj, 'meta', { enumerable: false, value: {} });
                }
                catch (e) {
                    e.message += '\n\nObj: ' + obj;
                    //throw e;
                    obj.meta = {};
                }
            }

            if (obj.meta.id === undefined) {
                obj.meta.id = noodle.ids.firstFree();
                noodle.ids.add(obj);
                hadId = false;
            }
        }
        else
            hadId = false;

        return { obj: obj, hadId: hadId };
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