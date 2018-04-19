var cloneCounter = 0; //TODO: Get rid of this guy or make it look good
noodle.object = new class extends noodle.any.constructor {

    newSameType(noodle, obj) {
        if (obj === null) {
            return null;
        }
        return new obj.constructor;
    }

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

    }

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
    }

    standardize(args) { //TODO: Dynamically figure out parent node
        var { noodle: noodle, obj: val } = args;
        if (val !== null && val !== undefined) {
            if (typeof val !== 'object' && typeof val !== 'function')
                return;
            /*
            //Set args.parNode of val{
            if (args.parNode == undefined || args.parNode.type != 'node') {
                args.parNode = val;
                while (args.parNode.parent !== undefined && args.parNode.type !== 'node' && args.parNode.parent !== val) {
                    args.parNode = args.parNode.parent;
                }
            }
            if (args.parNode.type != 'node')
                args.parNode = undefined;

            if (val.meta && val.meta.id === 9)
                var a = 42;
            val.addMeta({ parNode: args.parNode });
            //val.parNode = args.parNode;
            //}*/
            if (Object.isExtensible(val)) {
                /*
                //If val has neither value nor getter for parNode
                if (!val.hasValOrGetter('parNode')) {
                    (val.constructor.defineProperty || Object.defineProperty)(val, 'parNode', {
                        enumerable: false,
                        get: function () {
                            if (this.parent)
                                return this.parent.parNode;
                        }
                    });
                }
                */
                //Set type of val
                if (val.type == undefined && typeof val == 'object') {
                    Object.defineProperty(val, 'type', { enumerable: false, writable: true, configurable: true, value: 'obj' });
                }
                //Set noodleExp of val
                var noodleExp = val.noodleExp || args.noodle.expr.defaultNoodle(args.noodle, child);
                Object.defineProperty(val, 'noodleExp', { enumerable: false, writable: true, configurable: true, value: noodleExp });
            }
            //Set parent of properties
            var getDescr = val.constructor.getOwnPropertyDescriptor || Object.getOwnPropertyDescriptor;
            for (var i in val) {
                var descr = getDescr(val, i) || getDescr(val.__proto__, i);
                if (descr)
                    for (var child of [descr.value, descr.get, descr.set]) {
                        if ((typeof child === 'object' || typeof child === 'function') && child !== null && child !== undefined && i !== 'parent' && i !== 'parNode' && Object.isExtensible(child)) {
                            //If val.parent is already defined, Object.defineProperty() won't work
                            if (child.parent === undefined) {
                                Object.defineProperty(child, 'parent', { enumerable: false, writable: true, configurable: true, value: val });
                            }
                            else {
                                child.parent = val;
                            }
                        }
                    }
            }

        }
    }

    deepStandardize(args) {
        var { noodle: noodle, val: val, parNode: parNode, clone: clone, map: map } = args;
        clone = clone || {};
        map = map || {};
        /*noodle.object.clonePlus({
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
        });*/

        var serial = val.toSerial({
            noodle: noodle,
            idMap: noodle.ids.objsById
        });
        //throw new Error();
        for (var i in serial.idMap) {
            noodle.any.callFunc({
                noodle: noodle,
                val: serial.idMap[i].val,
                funcName: 'standardize',
                args: {
                    noodle: noodle,
                    parNode: parNode
                }
            });

        }
    }

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
    }

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
    }

    shallowClone(args) {
        if (args.clone === undefined)
            args.clone = {};

        for (var i in args.obj) {
            args.clone[i] = args.obj[i];
        }
        return args;
    }

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
    }

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
    }
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
    }

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
    }

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
    }

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
    }


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
    }

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
    }

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

    _toSerial(args) {
        var noodle = args.noodle;
        var val = args.val;
        var idMap = args.idMap = args.idMap || {};

        if (val === null) {
            return { serType: 'null', obj: null, val: null, id: 0 }; //TODO: Bad solution to the undefined id problem?
        }

        var serialized;
        //Make sure val has an id
        var id = noodle.ids.addIfAbsent({ noodle: noodle, val: val }).id;

        //If val isn't in idMap, add it
        if (idMap[id] === undefined) {
            //TODO: Non-enumerable stuff
            serialized = {
                serType: val.constructor.name.toLowerCase(), obj: {}, val: val, getters: {}, setters: {}, id: id
            };
            idMap[id] = serialized;
            for (var i in val) {
                if (i !== undefined) { //TODO? Is this ugly?
                    var getDescr = val.constructor.getOwnPropertyDescriptor || Object.getOwnPropertyDescriptor;
                    var descr = getDescr(val, i) || getDescr(val.__proto__, i);
                    if (descr && (descr.get || descr.set)) {
                        if (descr.get) {
                            serialized.getters[i] = noodle.function._toSerial({ noodle: noodle, val: descr.get, idMap: idMap });
                        }
                        if (descr.set) {
                            serialized.setters[i] = noodle.function._toSerial({ noodle: noodle, val: descr.set, idMap: idMap });
                        }
                    }
                    else {
                        var child = val[i];
                        //serialized.val[i] = child.toSerial(args);
                        serialized.obj[i] = noodle.any._toSerial({ noodle: noodle, val: child, idMap: idMap }).serialized;
                        if (serialized.obj[i] === undefined) {
                            throw new Error('toSerial failed');
                        }
                    }
                }
            }
        }
        //If val is already in idMap, just add its id
        else {
            serialized = { serType: 'id', obj: val.meta.id, val: val, id: id };
        }

        return { serialized: serialized, idMap: idMap };
    }

    _toDataStr(args) {
        //Vars from args{
        var noodle = args.noodle;
        //If the object has already been serialized and has an idMap, use those. Otherwise, toSerial
        if (args.serialized && args.idMap) {
            var serialized = args.serialized;
            var idMap = args.idMap;
        }
        else
            var { serialized: serialized, idMap: idMap } = noodle.any._toSerial(args);
        //}

        var str = '';

        for (var i in serialized.obj) {
            var child = serialized.obj[i];
            if (!child)
                debugger;
            str += i + ':' + noodle.any._toDataStr({
                noodle: noodle,
                val: child.val,
                obj: child.obj,
                serialized: child,
                idMap: idMap
            }).str;
        }
        str = (args.constr || noodle.any._constructorOf({
            noodle: noodle,
            val: serialized.val
            //TODO: Seems like null pops up here sometimes
        })).name + serialized.id + '|' + str.length + '|' + str;

        return { str: str, idMap: idMap, noodle: noodle };
    }

    _fromDataStr(args) {
        args.idMap = args.idMap || {};
        var { noodle: noodle, str: str, val, constr: constr, idMap: idMap } = args;
        args.val = val = val || new constr(); //TODO: What about {}?
        if (str.length < 200)
            console.log('\n\n\n\n\n'+str);
        //Example: str == "42|26|a:String5|hellob:Number(7)y:Boolean1|"
        var i = str.indexOf('|'); //i == 2
        var id = str.substr(0, i); //id == 42
        idMap[id] = val;

        str = str.substr(i + 1); //str == "26|a:String5|hellob:Number(7)y:Boolean1|"
        if (str.length < 20000)
            console.log('\n' + str);
        i = str.indexOf('|'); //i == 2
        var length = parseInt(str.substr(0, i)); //length == 26
        str = str.substr(i + 1);
        var strRest = str.substr(length); //strRest == "y:Boolean1|"
        str = str.substr(0, length); //str == "a:String5|hellob:Number(7)"

        var oldStrs = [];
        while (str) {
            oldStrs.push(str);
            if (str.substr(0,21) === 'click:Array6522|235|0')
                debugger;
            i = str.indexOf(':'); //i == 1
            var key = str.substr(0, i); //key == "a"
            args.str = str;
            args.str = str.substr(i + 1); //args.str == "String5|hellob:Number(7)"
            args.val = undefined;
            if (args.str === 'er0|')
                debugger;
            var { val: prop, strRest: str } = noodle.any._fromDataStr(args); //str == "b:Number(7)"
            val[key] = prop; //val.a == "hello"
        }

        return { noodle: noodle, val: val, strRest: strRest };
    }

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
}();

var args = {
    get str() {
        return this._str;
    },
    set str(val) {
        this._str = val;
        /*if (val === '0|')
            debugger;*/
    },
    noodle:noodle
};


Object.defineProperties(Object.prototype, {
    addMeta: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args) {
            if (this.meta === undefined) {
                this.constructor.defineProperty(this, 'meta', { enumerable: false, writable: true, configurable: true, value: {} });
            }
            for (var i in args.meta) {
                this.meta[i] = args.meta[i];
            }
        }
    },
    toSerial: {
        enumerable: false,
        writable: true,
        configurable: true,
        value: function (args = {}) {
            args.val = args.val || this;
            args.noodle = args.noodle || args.val.noodle || noodle;

            return noodle.object._toSerial(args);
        }
    },
    toDataStr: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args = {}) {
            args.val = this;
            args.noodle = args.noodle || args.val.noodle || noodle;

            return noodle.object._toDataStr(args);
        }
    },
    standardize: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args) {
            args.obj = args.obj || this;
            args.noodle = args.noodle || args.val.noodle || noodle;

            return noodle.object.standardize(args);
        }
    },
    /*
    add: {
        enumerable: false,
        value(args) {
            var { props: props, enumerable: enumerable } = args;
            var constr = this.constructor;
            if (enumerable === undefined) {
                for (var i of props.constructor.getOwnPropertyNames(props)) {
                    constr.defineProperty(this, i, { enumerable: props.propertyIsEnumerable(i), writable: true, configurable: true, value: props[i] });
                }
            }

            else
                for (var i in props) {
                    constr.defineProperty(this, i, { enumerable: enumerable, writable: true, configurable: true, value: props[i] });
                }
        }
    }*/
    hasValOrGetter: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(key) {
            var constr;
            //TODO?
            if (this.constructor.getOwnPropertyDescriptor)
                constr = this.constructor;
            else
                constr = Object;

            var propDesc = constr.getOwnPropertyDescriptor(this, key);
            return ((propDesc && propDesc.get) || this[key]) != undefined;
        }
    },
    concat: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(obj) {
            //TODO: Handle identical keys?
            var cat = {};
            for (var i in this) {
                cat[i] = this[i];
            }
            for (var i in obj) {
                cat[i] = obj[i];
            }
            return cat;
        }
    }
});

Object.defineProperties(Object, {
    fromDataStr: {
        enumerable: false,
        writable: true,
        configurable: true,
        value(args) {
            return args.noodle.object._fromDataStr(args);
        }
    }
});
