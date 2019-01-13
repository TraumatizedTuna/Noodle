noodle.container = new class extends noodle.object.constructor { }();

class Container extends Object{
    constructor(args = {}) {
        super();
        this.noodle = args.noodle || noodle;
        this.html = args.html;
    }
    get node() {
        Container.defineProperty(this, 'node', { value: nodeTypes.Container })
    }
}