noodle.comare = {
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
};