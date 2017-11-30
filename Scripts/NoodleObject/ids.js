noodle.ids = {
    //Lists describing free ids
    freeList: {
        obj: [0],
        node: [0],
        port: [0],
        wire: [0]
    },

    add(obj) {
        var objNoodle = noodle.expr.eval(noodle, obj.noodleExp);
        objNoodle[obj.type].objsById[obj.id] = obj;
    },

    //Gives you a free id from ids
    firstFree(ids = noodle.ids.freeList.obj) {
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