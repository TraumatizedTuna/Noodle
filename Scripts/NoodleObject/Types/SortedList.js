noodle.sList = {
    new(noodle, iterable = [], compare = noodle.object.compare, noodleExp) {
        if (iterable.length > 1) {
            //TODO: Sort
        }
        var sList = {
            type: 'sList',
            list: iterable,
            compare: compare
        };
        Object.defineProperty(sList, 'type', { enumerable: false, writable: true, configurable: true, value: 'sList'});
        sList.noodleExp = noodleExp || noodle.expr.defaultNoodle(noodle, sList);
        return sList;
    },
    get(noodle, sList, ind) {
        return sList.list[ind];
    },
    add(noodle, sList, el) {
        var ind = noodle.sList.expIndexOf(noodle, sList, el);
        if (ind == -1)
            return false;
        sList.list.splice(ind, 0, el);
        return true;
    },
    push(noodle, sList, el) {
        sList.list.push(el);
    },
    //Binary searches sList to find index of el
    indexOf(noodle, sList, el) {
        var list = sList.list;
        var mid;
        var min = 0;
        var max = list.length - 1;
        var comp;

        while (min <= max) {
            mid = Math.floor((min + max) / 2);
            comp = sList.compare(el, list[mid]);

            //If el < list[mid]
            if (comp < 0) {
                max = mid - 1;
            }
            //If el > list[mid]
            else if (comp > 0) {
                min = mid + 1;
            }
            //If el == list[mid]
            else {
                return mid;
            }
        }
        return -1;
    },
    //Binary search on an interval
    indexOfPlus(noodle, sList, el, min, max) {
        var list = sList.list;
        var mid;
        var comp;

        while (min <= max) {
            mid = Math.floor((min + max) / 2);
            comp = sList.compare(el, list[mid]);

            //If el < list[mid]
            if (comp < 0) {
                max = mid - 1;
            }
            //If el > list[mid]
            else if (comp > 0) {
                min = mid + 1;
            }
            //If el == list[mid]
            else {
                return mid;
            }
        }
        return -1;
    },
    expIndexOf(noodle, sList, el) {
        var list = sList.list;
        var mid;
        var min = 0;
        var max = list.length - 1;
        var comp;

        while (min <= max) {
            mid = Math.floor((min + max) / 2);
            comp = sList.compare(el, list[mid]);

            //If el < list[mid]
            if (comp < 0) {
                max = mid - 1;
            }
            //If el > list[mid]
            else if (comp > 0) {
                min = mid + 1;
            }
            //If el == list[mid]
            else {
                return -1;
            }
        }
        return mid;
    },
    //Binary searches sList to find the index of each element of the sorted list els, returns a list of indices
    indicesOfSorted(noodle, sList, els) {
        var inds = new Array(sList.length);
        var min = 0;
        var max = sList.length - 1;
        var halfLen = Math.ceil((els.length - 1) / 2);
        var i;
        var iInv;
        for (i = 0; i < halfLen;) {
            min = noodle.sList.indexOfPlus(noodle, sList, els[i], min, max);
            i++;
            iInv = els.length - i;
            max = noodle.sList.indexOfPlus(noodle, sList, els[iInv], min, max);

            inds[i] = min;
            inds[iInv] = max;
        }
        if (iInv - i === 2) {
            inds[halfLen] = noodle.sList.indexOfPlus(noodle, sList, els[halfLen], min, max);
        }
        return inds;




        /* var list = sList.list;
        var mid;
        var min = 0;
        var max = list.length - 1;
        var minComp;
        var maxComp;

        while (min <= max) {
            mid = Math.floor((min + max) / 2);
            minComp = compare(minEl, list[mid]);
            maxComp = compare(maxEl, list[mid]);
            //If minEl < list[mid]
            if (minComp > 0) {
                min = mid;
            }
            //If el > list[mid]
            if (comp > 0) {
                min = mid + 1;
            }
            //If el == list[mid]
            else {
                return mid;
            }
        }
        return -1;*/
    },

    //Was this supposed to be the same thing as expIndOf?
    indexOfNew(noodle, sList, el) {
        var list = sList.list;
        var mid;
        var min = 0;
        var max = list.length - 1;
        var comp;

        while (min <= max) {
            mid = Math.floor((min + max) / 2);
            comp = sList.compare(el, list[mid]);

            //If el < list[mid]
            if (comp < 0) {
                max = mid - 1;
            }
            //If el > list[mid]
            else if (comp > 0) {
                min = mid + 1;
            }
            //If el == list[mid]
            else {
                return mid;
            }
        }
        return -1;
    }
};