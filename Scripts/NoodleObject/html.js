noodle.html = {
    new(args) {
        var { noodle: noodle, code: code } = args;
        var hidEl = noodle.html.hiddenEl;
        //TODO: Temporary getter and setter
        if (noodle.html.hiddenEl === undefined) {
            document.body.insertAdjacentHTML('beforeend', '<div visibility="hidden"></div>');
            hidEl = noodle.html.hiddenEl = document.body.lastChild;
        }
        hidEl.insertAdjacentHTML('beforeend', code);
        return hidEl.lastChild;
    },

    setFullscreen(args) {
        var { noodle: noodle, element: el } = args;
        noodle.html.unsetFullscreen(noodle.html.fullscreenEl);
        el.meta.oldParentElement = el.parentElement;
        document.getElementById('fullscreen').appendChild(el);
        noodle.html.fullscreenEl = el;
    },

    unsetFullscreen(args) {
        var { noodle: noodle, element: el } = args;
        if (el) {
            el.meta.oldParentElement.appendChild(el);
            noodle.fullscreenEl = undefined;//Or should it be null perhaps? Well, who cares?
        }
        else {
            console.warn('Tried to unset fullscreen for element that does not exist. Maybe setFullscreen() has already removed it?');
        }
    },

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


