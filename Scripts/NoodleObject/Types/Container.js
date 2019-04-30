noodle.container = new class extends noodle.object.constructor { }();

class Container extends Object {
    constructor(args = {}) {
        super();
        this.noodle = args.noodle || noodle;

        if (args.html !== undefined) {
            this.html = args.html;
            if (args.node) {
                this.node = args.node;
            }
        }

        if (args.forest === undefined) {
            this.forest = [];
        }
        else {
            this.forest = args.forest;
        }

    }

    render(args = {}) {
        var { noodle: noodle, parEl: parEl } = args;

        if (parEl) {
            //this.isFullscreen = this.html === noodle.html.fullscreenEl; //TODO: Should isFullscreen have a getter and a setter instead?
            parEl.appendChild(this.html);
        }
        if (this.html) {
            this.html.style.visibility = 'visible';
            this.html.obj = this;
        }
    }

    toggleFullscreen() {
        var parCont = this.node.meta.container;
        if (this.isFullscreen) {
            //noodle.html.unsetFullscreen({noodle:noodle,element:this.html});
            this.node.html.appendChild(this.html);
            parCont.html.fullscreenEl = undefined;
        }
        else {
            parCont.setInnerFullscreen(this.html);
        }
        this.isFullscreen = !this.isFullscreen;
        this.updateButtons();
    }

    updateButtons() {
        var btnFs = this.html.getElementsByClassName('btnFullscreen')[0]; //TODO: Make sure this is actually the main fs button
        if (this.isFullscreen) {
            btnFs.innerHTML = '▣';
        }
        else {
            btnFs.innerHTML = '☐';
        }
    }

    setInnerFullscreen(el) {
        var oldFsEl = this.html.fullscreenEl;
        if (oldFsEl) {
            oldFsEl.meta.oldParentElement.appendChild(oldFsEl); //Put old fullscreen element back in its old container. TODO: What about order? Gaaah
        }
        this.html.fullscreenEl = el;
        el.meta.oldParentElement = el.parentElement;
        this.html.fullscreen.appendChild(el);
    }

    get node() {
        this.node = nodeTypes.Container({ noodle: noodle, container: this });
        return this.node;
    }
    set node(node) {
        return Container.defineProperty(this, 'node', { writable: true, configurable: true, value: node });
    }

    get html() {
        this.html = noodle.html.new({ noodle: noodle, code: '<div class="container mainContainer" id=' + this.meta.id + '><svg class="wireBoard"></svg><div class="btnFullscreen"></div><div class="fullscreen"></div></div>' });

        this.html.wireBoard = this.html.getElementsByClassName('wireBoard')[0];
        this.html.btnFs = this.html.getElementsByClassName('btnFullscreen')[0];
        this.html.btnFs.onclick = function () {
            return this.parentElement.obj.toggleFullscreen();
        };//Will this in the event be the container or the button?
        this.html.fullscreen = this.html.getElementsByClassName('fullscreen')[0];
        this.updateButtons();
        return this.html;
    }
    set html(html) {
        return Container.defineProperty(this, 'html', { writable: true, configurable: true, value: html });
    }
}