var cloneCounter = 0; //TODO: Get rid of this guy or make it look good
noodle.object = {

    newSameType(noodle, obj) {
        if (obj == null) {
            return null;
        }
        return new obj.constructor;
    },

    equals(noodle, obj0, obj1, depth) {
        if (depth <= 0)
            return true;
        if (typeof obj0 != 'object' || typeof obj1 != 'object' || obj0 == null || obj1 == null) {
            var eq = obj0 == obj1;
            return eq;
        }
        if (Object.getOwnPropertyNames(obj0).length != Object.getOwnPropertyNames(obj1).length)
            return false;

        depth--;
        for (var i in obj0) {
            var eq = (noodle.object.equals(noodle, obj0[i], obj1[i], depth)); //TODO: Figure out why the following if can't evaluate this stuff itself
            if (!eq)
                return false;
        }
        return true;

    },

    compare(noodle, obj0, obj1) {
        if (obj0 === obj1) {
            return 0;
        }
        if (typeof obj0 === 'object' || typeof obj0 === 'function') {
            if (typeof obj1 === 'object' || typeof obj1 === 'function') {
                if (obj0.id === undefined) {
                    obj0.id = noodle.ids.firstFree();
                    if (obj1.id === undefined) {
                        obj1.id = noodle.ids.firstFree();
                    }
                }
                return compare(obj0.id, obj1.id);
            }
            return 1;
        }
        if (typeof obj1 === 'object' || typeof obj1 === 'function') {
            return -1;
        }

        if (typeof obj0 === 'string') {
            if (typeof obj1 === 'string') {
                if (obj0.length === obj1.length) {
                    for (var i in obj0) {
                        if (obj0[i] !== obj1[i]) {
                            if (obj0[i] < obj1[i])
                                return -1;
                            return 1;
                        }
                    }
                }
                return obj0.length - obj1.length;
            }
        }
        return obj0 - obj1;
    },

    standardize(noodle, obj, parNode) { //TODO: Dynamically figure out parent node
        if (obj != null && obj != undefined) {
            if (typeof obj != 'object' && typeof obj != 'function')
                return;
            //Set parNode of obj{
            if (parNode == undefined || parNode.type != 'node') {
                parNode = obj;
                while (parNode.parent != undefined && parNode.type != 'node') {
                    parNode = parNode.parent;
                }
            }
            if (parNode.type != 'node')
                parNode = undefined;
            Object.defineProperty(obj, 'parNode', { enumerable: false, value: parNode });
            //obj.parNode = parNode;
            //}

            //Set type of obj
            if (obj.type == undefined && typeof obj == 'object') {
                Object.defineProperty(obj, 'type', { enumerable: false, value: 'obj' });
            }

            //Set parent of properties
            for (var i in obj) {
                if (typeof obj[i] == 'object' && obj[i] != null && obj[i] != undefined && i != 'parent' && i != 'parNode') {
                    Object.defineProperty(obj[i], 'parent', { enumerable: false, value: obj });
                    //obj[i].parNode = parNode;
                }
            }

            //Set noodleExp of obj
            var noodleExp = obj.noodleExp || noodle.expr.defaultNoodle(noodle, obj);
            Object.defineProperty(obj, 'noodleExp', { enumerable: false, value: noodleExp });
        }
    },

    deepStandardize(noodle, obj, parNode, clone = {}, map = {}) {
        noodle.object.clonePlus(
            noodle,
            obj,
            clone,
            map,
            [],
            [],
            [],
            [],
            function (noodle, obj, clone, flatList, flatClone, map, parNode) {
                noodle.object.standardize(noodle, obj, parNode);
            }, //func
            function (noodle, obj) {
                if (obj != undefined && obj != null)
                    return obj.type != 'expr';
                return false;
            }, //cond
            parNode
        );
    },

    toStr(noodle, obj, depth = 3, indent = '') {
        if (typeof obj !== 'object' || depth <= 0)
            return obj;

        depth--;
        var str = '';
        var end;
        for (var i in obj) {
            str += indent + i + ': ' + noodle.object.toStr(noodle, obj, depth, indent + ' ') + ',\n';
        }
        str = str.substr(0, str.length - 2); //Kinda ugly?
        if (obj.constructor === Array) {
            return '[\n' + str + '\n' + indent + ']';
        }
        return '[\n' + str + '\n' + indent + '}';
    },

    //TODO: Generalize flatList and clone to one function that takes a function as an argument?

    //Digs up all descendants of obj and adds them as elements in flatList
    flatList(noodle, obj, flatList = []) {

        if (typeof obj == 'object') {
            for (var i in obj) {
                if (flatList.indexOf(obj[i]) == -1) { //If obj[i] hasn't already been found
                    flatList.push(obj[i]);
                    //flatList = flatList.concat(
                    noodle.object.flatList(noodle, obj[i], flatList);
                }
            }
            return flatList;
        }
        return [obj]; //In case obj is a primitive type
    },

    //Turns clone into a deep clone of obj. flatList and flatClone are optional but should have same length, preferably 0
    clone(noodle, obj, clone, flatList = [], flatClone = []) {
        cloneCounter++;
        //flatClone.push(clone);
        if (obj == undefined)
            return obj;

        if (typeof obj == 'object') {
            //If clone is undefined, make it an empty array or object
            if (clone == undefined) {
                if (obj.constructor == Array) {
                    clone = new Array(obj.length);
                }
                else {
                    clone = {};
                }
            }
            flatList.push(obj);
            flatClone.push(clone);
            //Go through obj to clone all its properties
            for (var i in obj) {
                var flatInd = flatList.indexOf(obj[i]);
                //If we've found a new object, add it to flatList and clone it to clone and flatClone
                if (flatInd == -1) {
                    //clone[i] = clone[i] || {};
                    clone[i] = noodle.object.clone(noodle, obj[i], clone[i], flatList, flatClone); //This works because flatList gets updated
                }
                //If we've seen obj[i] before, add the clone of it to clone
                else {
                    clone[i] = flatClone[flatInd];
                }
            }
            return clone;
        }
        return obj;
    },

    //Same as clone but applies all arguments except func and cond to func and cond. Stops recursion if cond returns false
    binClonePlus(noodle, obj, clone, map = {}, flatList = noodle.sList.new(noodle), flatClone = noodle.sList.new(noodle), flatMap = noodle.sList.new(noodle), path = [], func = function () { }, cond = function () { return true; }) {
        //Add unpassed parameters to arguments{
        [arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9]] = [clone, map, flatList, flatClone, flatMap, path, func, cond];
        if (arguments.length < 10) //This condition is necessary since arguments might be longer than 8
            arguments.length = 10;
        //}

        var args = Array.from(arguments);
        args.splice(7, 2);
        if (!cond.apply(undefined, args)) {
            return obj;
        }
        func.apply(undefined, args);

        //flatClone.push(clone);
        if (obj == null || obj == undefined)
            return obj;

        if (typeof obj == 'object') {
            //If clone is undefined, make it an empty array or object
            if (clone == undefined) {
                if (obj.constructor === Array) {
                    clone = [];
                }
                else {
                    clone = {};
                }
            }
            noodle.sList.add(noodle, flatList, obj);
            noodle.sList.add(noodle, flatClone, clone);
            noodle.sList.add(noodle, flatMap, path);

            var flatInd;
            //TODO: Find indices before loop
            //Go through obj to clone all its properties
            for (var i in obj) {
                [...path] = path; //Shallow clone path
                path.push(i);
                flatInd = noodle.sList.indexOf(noodle, flatList, obj[i]);
                //If we've found a new object, add it to flatList and clone it to clone and flatClone
                if (flatInd == -1) {
                    //Set up map[i]{
                    var mapVal;
                    var isObj = true;
                    //If obj[i] is not null or undefined, let mapVal be of the same type{
                    if (obj[i] != undefined) {
                        if (obj[i].constructor === Array)
                            mapVal = [];
                        else if (typeof obj[i] === 'object')
                            mapVal = {};
                        else {
                            mapVal = obj[i];
                            isObj = false;
                        }
                    }
                    else {
                        mapVal = obj[i];
                        isObj = false;
                    }
                    //}
                    map[i] = { recog: false, val: mapVal, isObj: isObj };
                    //}
                    //clone[i] = clone[i] || {};
                    [...args] = arguments; //TODO: Guess I could place this line outside the loop?

                    args[1] = obj[i];
                    args[2] = clone[i];
                    args[3] = map[i].val;
                    clone[i] = noodle.object.binClonePlus.apply(undefined, args); //This works because flatList gets updated

                }
                //If we've seen obj[i] before, add the clone of it to clone
                else {
                    clone[i] = noodle.sList.get(noodle, flatClone, flatInd);
                    map[i] = { recog: true, path: noodle.sList.get(noodle, flatMap, flatInd) };
                }
            }
            return clone;
        }
        return obj;
    },
    //Same as clone but applies all arguments except func and cond to func and cond. Stops recursion if cond returns false
    clonePlus(noodle, obj, clone, map = {}, flatList = [], flatClone = [], flatMap = [], path = [], func = function () { }, cond = function () { return true; }) {
        //Add unpassed parameters to arguments{
        [arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9]] = [clone, map, flatList, flatClone, flatMap, path, func, cond];
        if (arguments.length < 10) //This condition is necessary since arguments might be longer than 8
            arguments.length = 10;
        //}

        var args = Array.from(arguments);
        args.splice(7, 2);
        if (!cond.apply(undefined, args)) {
            return obj;
        }
        func.apply(undefined, args);

        if (obj != undefined && typeof obj == 'object') {
            //If clone is undefined, make it an empty array or object
            if (clone == undefined) {
                if (obj.constructor === Array) {
                    clone = [];
                }
                else {
                    clone = {};
                }
            }
            flatList.push(obj);
            flatClone.push(clone);
            flatMap.push(path);
            //Go through obj to clone all its properties
            for (var i in obj) {
                [...path] = path;
                path.push(i);
                var flatInd = flatList.indexOf(obj[i]);
                //If we've found a new object, add it to flatList and clone it to clone and flatClone
                if (flatInd == -1) {
                    //Set up map[i]{
                    var mapVal;
                    var isObj = true;
                    if (obj[i] != undefined) {
                        if (obj[i].constructor === Array)
                            mapVal = new Array(obj[i].length);
                        else if (typeof obj[i] === 'object')
                            mapVal = {};
                        else {
                            mapVal = obj[i];
                            isObj = false;
                        }
                    }
                    else {
                        mapVal = obj[i];
                        isObj = false;
                    }
                    map[i] = { recog: false, val: mapVal, isObj: isObj };
                    //}
                    //clone[i] = clone[i] || {};
                    [...args] = arguments; //TODO: Guess I could place this line outside the loop?

                    args[1] = obj[i];
                    args[2] = clone[i];
                    args[3] = map[i].val;
                    if (args[3] === null) {
                        var apa = 'prutt';
                    }
                    clone[i] = noodle.object.clonePlus.apply(undefined, args); //This works because flatList gets updated

                }
                //If we've seen obj[i] before, add the clone of it to clone
                else {
                    clone[i] = flatClone[flatInd];
                    map[i] = { recog: true, path: flatMap[flatInd] };
                }
            }
            return clone;
        }
        clone = obj;
        //Can't do map = {...} since the reference must be kept
        /*map.recog = false;
        map.val = clone;
        map.isObj = false;*/
        return obj;
    },

    /*map(noodle, obj, map = {}){
        noodle.object.clonePlus(
            noodle,
            obj,
            {},
            [],
            [],
            function(noodle, obj, clone, flatList, flatClone, map) {
                for(var i in obj) {
                    if
                        }
                        },
                            undefined,
                                map
                            );
                },*/

    guidedClone(noodle, map, clone = {}, baseClone = clone) {
        for (var i in map) {
            if (map[i].recog) {
                //Follow map.path to find property{
                var prop = baseClone;
                for (var i in map.path) {
                    prop = prop[i];
                }
                //}

                clone[i] = prop;
            }
            else {
                if (map[i].isObj) {
                    //Set up clone[i] to be either an array or an object
                    if (!clone[i]) {
                        if (map[i].constructor === Array)
                            clone[i] = {};
                        else
                            clone[i] = [];
                    }

                    clone[i] = noodle.object.guidedClone(noodle, map[i].val, clone[i], baseClone);
                }
                else
                    clone[i] = map[i].val;
            }
        }
        return clone;
    },

    autoClone(noodle, obj, clone) {
        if (typeof obj !== 'object') {
            return obj;
        }
        if (obj.map == undefined) {
            var map = {};
            clone = noodle.object.clonePlus(noodle, obj, clone, map);
            if (Object.keys(obj).length != Object.keys(clone).length) {
                console.error('Clone has ' + Object.keys(clone).length + ' keys while original has ' + Object.keys(obj).length + ' keys');
            }
            obj.map = map;
        }
        else {
            clone = noodle.object.guidedClone(noodle, obj.map);
        }
        clone.map = {};
        $.extend(clone.map, obj.map);

        if (Object.keys(obj).length <= 1 || Object.keys(clone).length <= 1) {
            console.error('Original or clone has only map\n Original: ' + noodle.object.toStr(noodle, obj) + '\n Clone: ' + noodle.object.toStr(noodle, clone));
        }

        return clone;
    },

    //Don't think this guy works but you could get a flat clone frome the ordinary clone function   
    flatClone(noodle, flatList = noodle.object.flatList(obj), newList = new Array(flatList.length)) { //Kinda stupid to check lists for each recursion?
        for (var i in flatList) {
            var obj = flatList[i];
            if (typeof obj == 'object') {
                //Go through obj to find its properties in flatList and clone them to newList
                for (var j in obj) {
                    var ind = flatList.indexOf(obj[i]);//Find obj[i] in flatList
                    if (ind != -1) {
                        if (newList[i] == undefined) {//If this object hasn't been found before
                            newList[i] = shallowClone(); //TODO
                        }
                    }
                }
            }
            return $.extend(null, obj);
        }
    },


    badCompare(noodle, obj0, obj1) {
        if (typeof obj0 === 'object') { //If obj0 is object/array
            if (obj0.length != obj1.length) {
                if (obj0.length > obj1.length)
                    ret
            }
            if (typeof obj1 === 'object') { //If both are object/array
                if (obj0.constructor === Array) { //If obj0 is object/array and obj1 is array
                    if (obj1.constructor === Array) { //If both are array
                        //if(obj1.length)
                    }
                }
            }
        }
    },

    random(noodle, contProb = 0.8, mem = [], drawProb = 0.5, types = ['object', 'array', 'string', 'number']) {
        var obj = {};

        while (Math.random() < contProb) {
            var type = types[Math.floor(Math.random() * types.length)];
            var key = noodle.string.random(noodle, contProb);
            obj[key] = noodle[type].random(noodle, contProb);
        }
        return obj;
    },

    toHtml(noodle, obj) {
        var html = '';
        for (var i in obj) {
            html += '<div class="prop">';
            var child = obj[i];
            var type = undefined;
            var toHtml = undefined;

            if (child)
                type = noodle[child.type];
            if (type) {
                toHtml = type.toHtml;
            }
            if (toHtml) {
                html += toHtml(noodle, child);
            }
            else {
                type = noodle[typeof child]
                if (type)
                    toHtml = type.toHtml;
                if (toHtml) {
                    html += toHtml(noodle, child)
                }
                else
                    html += child;
            }
            html += '</div>';
        }
        return html;
    }
};
