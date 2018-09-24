class Pos {
    constructor(args = {}) {
        var xVal, yVal = 0;

        Object.defineProperty(
            this,
            'x',
            {
                set: function (x) {
                    xVal = x;//parseFloat(x);
                    if (isNaN(xVal)) {
                        throw new TypeError(x + ' could not be parsed to legal number');
                    }
                    if(isNaN(x)){
                        console.warn('annoying x val')
                    }
                },
                get: function () {
                    return xVal;
                }
            }
        );

        Object.defineProperty(
            this,
            'y',
            {
                set: function (y) {
                    yVal = y;//parseFloat(y);
                    if (isNaN(yVal)) {
                        throw new TypeError(y + ' could not be parsed to legal number');
                    }
                },
                get: function () {
                    return yVal;
                }
            }
        );

        this.x = args.x || 0;
        this.y = args.y || 0;
        this.meta = {};
    }
    show() {
        return Pos.show(this);
        }
    assign(p){
        this.x = p.x;
        this.y = p.y;
    }
}

Pos.show = function (p) {
    posShowEl.style.left = p.x + 'px';
    posShowEl.style.top = p.y + 'px';
    return posShowEl;
}