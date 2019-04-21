noodle.container = new class extends noodle.object.constructor { }();

class Container extends Object {
    constructor(args = {}) {
        super();
        this.noodle = args.noodle || noodle;

        this.html = args.html;
        if (args.node) {
            this.node = args.node;
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
            this.isFullscreen = parEl === Document;
            if (this.html) {
                parEl.appendChild(this.html);
            }
            else {
                parEl.insertAdjacentHTML('beforeend', '<div class="container mainContainer" id=' + this.meta.id + '><svg id="wireBoard' + this.meta.id + '" width="100%"></svg><div class="btnFullscreen"></div></div>');
                this.html = parEl.childNodes.item(this.meta.id);
                this.html.wireBoard = this.html.childNodes.item('wireBoard' + this.meta.id);
                this.html.btnFs = this.html.getElementsByClassName('btnFullscreen')[0];
                this.html.btnFs.onclick = function () {
                    return this.parentElement.obj.toggleFullscreen();
                };//Will this in the event be the container or the button?
                this.updateButtons();
            }
        }
        if (this.html) {
            this.html.style.visibility = 'visible';
            this.html.obj = this;
        }
    }

    toggleFullscreen() {
        if (this.isFullscreen) {
            this.node.html.appendChild(this.html);
        }
        else {
            var parCont = this.node.meta.container;
            parCont.html.appendChild(this.html);
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

    get node() {
        this.node = nodeTypes.Container({ noodle: noodle, container: this });
        return this.node;
    }
    set node(node) {
        Container.defineProperty(this, 'node', { value: node });
    }

}