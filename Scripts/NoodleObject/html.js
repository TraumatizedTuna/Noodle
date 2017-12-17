noodle.html = {
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
    //TODO: 0 should give pos of el?
    getElPos(el, depth) {
        var pos = { x: 0, y: 0 };
        for (var i = 0; i < depth && el; i++) {
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
        while (!noodle.html.hasClass(el = el.parentElement, 'node'));
        return el;
    }
};