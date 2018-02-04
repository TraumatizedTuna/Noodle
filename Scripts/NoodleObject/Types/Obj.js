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

    standardize(args) { //TODO: Dynamically figure out parent node
        if (args.obj != null && args.obj != undefined) {
            if (typeof args.obj != 'object' && typeof args.obj != 'function')
                return;
            //Set args.parNode of args.obj{
            if (args.parNode == undefined || args.parNode.type != 'node') {
                args.parNode = args.obj;
                while (args.parNode.parent != undefined && args.parNode.type != 'node') {
                    args.parNode = args.parNode.parent;
                }
            }
            if (args.parNode.type != 'node')
                args.parNode = undefined;
            Object.defineProperty(args.obj, 'parNode', { enumerable: false, value: args.parNode });
            //args.obj.parNode = args.parNode;
            //}

            //Set type of args.obj
            if (args.obj.type == undefined && typeof args.obj == 'object') {
                Object.defineProperty(args.obj, 'type', { enumerable: false, value: 'obj' });
            }

            //Set parent of properties
            for (var i in args.obj) {
                if (typeof args.obj[i] === 'object' && args.obj[i] !== null && args.obj[i] !== undefined && i !== 'parent' && i !== 'parNode') {
                    //If args.obj[i].parent is already defined, Object.defineproprty() won't work
                    if (args.obj[i].parent === undefined) {
                        Object.defineProperty(args.obj[i], 'parent', { enumerable: false, value: args.obj });
                    }
                    else {
                        args.obj[i].parent = args.obj;
                    }
                }
            }

            //Set noodleExp of args.obj
            var noodleExp = args.obj.noodleExp || args.noodle.expr.defaultNoodle(args.noodle, args.obj);
            Object.defineProperty(args.obj, 'noodleExp', { enumerable: false, value: noodleExp });
        }
    },

    deepStandardize(noodle, obj, parNode, clone = {}, map = {}) {
        noodle.object.clonePlus({
            noodle: noodle,
            obj: obj,
            clone: clone,
            map: map,
            flatList: [],
            flatClone: [],
            flatMap: [],
            path: [],
            func: function (args) {
                noodle.object.standardize(args);
            }, //func
            cond: function (args) {
                var obj = args.obj;
                if (obj !== undefined && obj !== null)
                    return obj.type !== 'expr';
                return false;
            }, //cond
            parNode: parNode
        });
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

    shallowClone(args) {
        if (args.clone === undefined)
            args.clone = {};

        for (var i in args.obj) {
            args.clone[i] = args.obj[i];
        }
        return args;
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
    //Arguments: noodle, obj, clone, map = {}, flatList =[], flatClone =[], flatMap =[], path =[], func = function () { }, cond = function () { return true; }
    clonePlus(args) {
        
        if (!args.cond(args)) {
            return args.obj;
        }
        args.func(args);

        if (args.obj != undefined && typeof args.obj == 'object') {
            //If args.clone is undefined, make it an empty array or object
            if (args.clone === undefined) {
                if (args.obj.constructor === Array) {
                    args.clone = [];
                }
                else {
                    args.clone = {};
                }
            }
            args.flatList.push(args.obj);
            args.flatClone.push(args.clone);
            args.flatMap.push(args.path);
            //Go through args.obj to args.clone all its properties
            for (var i in args.obj) {
                [...args.path] = args.path;
                args.path.push(i);
                var flatInd = args.flatList.indexOf(args.obj[i]);
                //If we've found a new args.object, add it to args.flatList and args.clone it to args.clone and flatargs.clone
                if (flatInd == -1) {
                    //Set up args.map[i]{
                    var mapVal
                    var isObj = true;
                    if (args.obj[i] != undefined) {
                        if (args.obj[i].constructor === Array)
                            mapVal = new Array(args.obj[i].length);
                        else if (typeof args.obj[i] === 'args.object')
                            mapVal = {};
                        else {
                            mapVal = args.obj[i];
                            isObj = false;
                        }
                    }
                    else {
                        mapVal = args.obj[i];
                        isObj = false;
                    }
                    args.map[i] = { recog: false, val: mapVal, isObj: isObj };
                    //}
                    //args.clone[i] = args.clone[i] || {};
                    var newArgs = args.noodle.object.shallowClone({ noodle: args.noodle, obj: args, clone: {} }).clone; //TODO: Guess I could place this line outside the loop?

                    newArgs.obj = args.obj[i];
                    newArgs.clone = args.clone[i];
                    newArgs.map = args.map[i].val;
                    args.clone[i] = args.noodle.object.clonePlus(newArgs); //This works because args.flatList gets updated

                }
                //If we've seen args.obj[i] before, add the args.clone of it to args.clone
                else {
                    args.clone[i] = args.flatClone[flatInd];
                    args.map[i] = { recog: true, path: args.flatMap[flatInd] };
                }
            }
            return args.clone;
        }
        args.clone = args.obj;
        //Can't do args.map = {...} since the reference must be kept
        /*args.map.recog = false;
        args.map.val = args.clone;
        args.map.isObj = false;*/
        return args.obj;
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

    random(args) {
        var noodle = args.noodle;
        var contProb = args.contProb || 0.7;
        var mem = args.mem = args.mem || [];
        var drawProb = args.drawProb || 0.5;
        var types = args.types || ['object', 'array', 'string', 'number'];

        var obj = {};

        while (Math.random() < contProb) {
            var type = types[Math.floor(Math.random() * types.length)];
            var key = noodle.string.random(args);
            obj[key] = noodle[type].random(args);
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
    },

    serialize(args) {
        var noodle = args.noodle;
        var obj = args.obj;
        var idMap = args.idMap = args.idMap || {};

        if (obj === null) {
            return { serType: 'null', val: null, obj: null };
        }

        var serialized;
        //Make sure obj has an id
        noodle.ids.addIfAbsent({ noodle: noodle, obj: obj });

        //If obj isn't in idMap, add it
        if (idMap[obj.meta.id] === undefined) {
            //TODO: Non-enumerable stuff
            serialized = { serType: 'object', val: {}, obj: obj };
            idMap[obj.meta.id] = serialized;
            for (var i in obj) {
                serialized.val[i] = noodle.any.serialize({ noodle: noodle, obj: obj[i], idMap: idMap }).serialized;
            }
        }
        //If obj is already in idMap, just add its id
        else {
            serialized = { serType: 'id', val: obj.meta.id, obj: obj };
        }

        return { serialized: serialized, idMap: idMap };
    },

    toDataStr(args) {
        //Vars from args{
        var noodle = args.noodle;
        //If the object has already been serialized and has an idMap, use those. Otherwise, serialize
        if (args.serialized && args.idMap) {
            var serialized = args.serialized;
            var idMap = args.idMap;
        }
        else
            var { serialized: serialized, idMap: idMap } = noodle.any.serialize(args);
        //}

        var str = '';

        for (var i in serialized.val) {
            var child = serialized.val[i];
            str += i + ':' + noodle.any.toDataStr({
                noodle: noodle,
                obj: child.obj,
                serialized: child,
                idMap: idMap
            }).str;
        }
        str = 'object' + str.length + '|' + str;

        return { str: str };
    },

    reduceErrVal(args) {
        var noodle = args.noodle;
        var func = args.func;
        var key = args.key;
        var testArgs = args.testArgs || {};
        var types = args.randArgs.types;
        var errVal = args.errVal;

        //Loop to find if any of the children of errVal is enough to cause the error
        for (var i in errVal) {
            var errChild = errVal[i];
            //If errChild has a legal type
            if (types && noodle.any.hasAnyType({ noodle: noodle, val: errChild, types: types }).hasType) {

                testArgs[key] = errChild;
                try {
                    func(testArgs);
                    errVal[i] = undefined;
                    testArgs[key] = errVal;
                    //Try to remove errChild, otherWise reduce it
                    try {
                        func(testArgs);
                        //If there's no error without errChild, add it back
                        errVal[i] = errChild;
                        args.errVal = errVal;
                    }
                    //If we get an error without errChild
                    catch (e) {
                        args.error = e;
                    }

                } catch (e) {
                    args.error = e;
                    args.errVal = errChild;
                    return noodle.any.reduceErrVal(args);
                }
            }
        }

        return args;
    }
};
