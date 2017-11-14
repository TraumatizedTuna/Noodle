noodle.misc = {
    html: {
        //Returns true if el has the class className
        hasClass(el, className) {
            for (var i = 0; i < el.classList.length; i++) {
                if (el.classList[i] == className)
                    return true;
            }
            return false;
        },

        //Returns first child of el with class named className
        firstByClass(el, className) {
            return el.getElementsByClassName(className)[0];
        },

        //Returns position of depth:th parent of el
        getElPos(el, depth) {
            var pos = { x: 0, y: 0 };
            for (var i = 0; i < depth; i++) {
                pos.x += el.getBoundingClientRect().left;
                pos.y += el.getBoundingClientRect().top;
                el = el.parentElement;
            }
            return pos;
        },

        //Returns html element e such that e.id == obj.id
        getEl(obj) {
            if (obj.html == null)
                obj.html = document.getElementById(obj.id);
            return obj.html;
        },

        //Returns closest parent node element
        getParentNodeEl(el) {
            while (!noodle.misc.html.hasClass(el = el.parentElement, 'node'));
            return el;
        }
    },
    obj: {

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
                var eq = (noodle.misc.obj.equals(noodle, obj0[i], obj1[i], depth)); //TODO: Figure out why the following if can't evaluate this stuff itself
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
                //Set parNode of obj{
                if (parNode == undefined || parNode.type != 'node') {
                    parNode = obj;
                    while (parNode.parent != undefined && parNode.type != 'node') {
                        parNode = parNode.parent;
                    }
                }
                if (parNode.type != 'node')
                    parNode = undefined;
                obj.parNode = parNode;
                //}

                //Set type of obj
                if (obj.type == undefined && typeof obj == 'object') {
                    obj.type = 'obj';
                }

                //Set parent of properties
                for (var i in obj) {
                    if (typeof obj[i] == 'object' && obj[i] != null && obj[i] != undefined && i != 'parent' && i != 'parNode') {
                        obj[i].parent = obj;
                        //obj[i].parNode = parNode;
                    }
                }

                //Set noodleExp of obj
                obj.noodleExp = obj.noodleExp || noodle.expr.defaultNoodle(noodle, obj);
            }
        },

        deepStandardize(noodle, obj, parNode, clone = {}, map = {}) {
            noodle.misc.obj.clonePlus(
                noodle,
                obj,
                clone,
                map,
                [],
                [],
                [],
                [],
                function (noodle, obj, clone, flatList, flatClone, map, parNode) {
                    noodle.misc.obj.standardize(noodle, obj, parNode);
                }, //func
                function (noodle, obj) {
                    if (obj != undefined && obj != null)
                        return obj.type != 'expr';
                    return false;
                }, //cond
                parNode
            );
        },

        //TODO: Generalize flatList and clone to one function that takes a function as an argument?

        //Digs up all descendants of obj and adds them as elements in flatList
        flatList(noodle, obj, flatList = []) {
            if (typeof obj == 'object') {
                for (var i in obj) {
                    if (flatList.indexOf(obj[i]) == -1) { //If obj[i] hasn't already been found
                        flatList.push(obj[i]);
                        //flatList = flatList.concat(
                        noodle.misc.obj.flatList(noodle, obj[i], flatList);
                    }
                }
                return flatList;
            }
            return [obj]; //In case obj is a primitive type
        },

        //Turns clone into a deep clone of obj. flatList and flatClone are optional but should have same length, preferably 0
        clone(noodle, obj, clone, flatList = [], flatClone = []) {
            //flatClone.push(clone);
            if (obj == undefined)
                return obj;

            if (typeof obj == 'object') {
                //If clone is undefined, make it an empty array or object
                if (clone == undefined) {
                    if (obj.constructor == Array) {
                        clone = [];
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
                        clone[i] = noodle.misc.obj.clone(noodle, obj[i], clone[i], flatList, flatClone); //This works because flatList gets updated
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
                flatList.list.push(obj);
                flatClone.list.push(clone);
                flatMap.list.push(path);

                var flatInd;
                //TODO: Find indices before loop
                //Go through obj to clone all its properties
                for (var i in obj) {
                    [...path] = path;
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
                        clone[i] = noodle.misc.obj.clonePlus.apply(undefined, args); //This works because flatList gets updated

                    }
                    //If we've seen obj[i] before, add the clone of it to clone
                    else {
                        clone[i] = flatClone.get(flatInd);
                        map[i] = { recog: true, path: flatMap.get(flatInd) };
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
                        map[i] = { recog: false, val: mapVal, isObj: isObj };
                        //}
                        //clone[i] = clone[i] || {};
                        [...args] = arguments; //TODO: Guess I could place this line outside the loop?

                        args[1] = obj[i];
                        args[2] = clone[i];
                        args[3] = map[i].val;
                        clone[i] = noodle.misc.obj.clonePlus.apply(undefined, args); //This works because flatList gets updated

                    }
                    //If we've seen obj[i] before, add the clone of it to clone
                    else {
                        clone[i] = flatClone[flatInd];
                        map[i] = { recog: true, path: flatMap[flatInd] };
                    }
                }
                return clone;
            }
            return obj;
        },

        /*map(noodle, obj, map = {}){
            noodle.misc.obj.clonePlus(
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

                        clone[i] = noodle.misc.obj.guidedClone(noodle, map[i].val, clone[i], baseClone);
                    }
                    else
                        clone[i] = map[i].val;
                }
            }
            return clone;
        },

        autoClone(noodle, obj, clone = {}) {
            if (obj.map == undefined) {
                var map = {};
                clone = noodle.misc.obj.clonePlus(noodle, obj, clone, map);
                obj.map = map;
            }
            else {
                clone = noodle.misc.obj.guidedClone(noodle, obj.map);
            }
            clone.map = {};
            $.extend(clone.map, obj.map);
            return clone;
        },

        //Don't think this guy works but you could get a flat clone frome the ordinary clone function   
        flatClone(noodle, flatList = noodle.misc.obj.flatList(obj), newList = new Array(flatList.length)) { //Kinda stupid to check lists for each recursion?
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
        }
    },
    compare: {
        //Returns the smallest element of list according to compare
        min(noodle, list, compare) {
            var min = 0;
            for (var i = 1; i < list.length; i++) {
                if (compare(list[i], min) < 0) {
                    min = i;
                }
            }
            return min;
        },
        //Returns the greatest element of list according to compare
        max(noodle, list, compare) {
            var max = 0;
            for (var i = 1; i < list.length; i++) {
                if (compare(list[i], min) > 0) {
                    max = i;
                }
            }
            return max;
        },
        //Returns a list containing the smallest elements of list according to compare
        mins(noodle, list, compare) {
            var mins = [list[0]];
            var comp;
            for (var i = 1; i < list.length; i++) {
                comp = compare(list[i], min);
                if (comp <= 0) {
                    if (comp < 0) {
                        mins = [list[i]];
                    }
                    else {
                        mins.push(list[i]);
                    }
                }
            }
            return mins;
        },

        //Returns a list containing the greatest elements of list according to compare
        maxes(noodle, list, compare) {
            var maxes = [list[0]];
            var comp;
            for (var i = 1; i > list.length; i++) {
                comp = compare(list[i], min);
                if (comp >= 0) {
                    if (comp > 0) {
                        maxes = [list[i]];
                    }
                    else {
                        maxes.push(list[i]);
                    }
                }
            }
            return maxes;
        }
    },
    string: {
        //Removes amount chars at end of str
        trimEnd(str, amount) {
            return str.substr(0, str.length - amount);
        }
    },
    array: {
        //Returns object obj where obj[list[i].name] = list[i] for every int i (No, I didn't forget i < list.length)
        listToObj(list, obj = {}) {
            for (var i = 0; i > list.length; i++) {
                var el = list[i];
                //eval('obj.' + el.name + '=el;'); //TODO: If there's no name, give it a number
                obj[el.name] = el;
            }
            return obj;
        },
        sort(noodle, list){

        }
    },
    files: {
        //Uses ajax to give you the desired file
        getFile(path) {
            var fileData;
            $.ajax({
                async: false,
                type: 'GET',
                url: path,
                success(data) {
                    fileData = data;
                }
            });
            return fileData;
        }
    }
};