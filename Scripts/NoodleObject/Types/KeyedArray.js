class KeyedArray extends Array {
    constructor(obj) {
        super();
        var map = {};
        

        Array.defineProperties(this, {


            indices: {
                enumerable: false,
                writable: true,
                configurable: true,
                value: {}
            },

            find: {
                enumerable: false,
                writable: true,
                configurable: true,
                value(key) {
                    return map['___' + key];
                }
            },
            assign: {
                enumerable: false,
                writable: true,
                configurable: true,
                value(key, val) {
                    key = '___' + key;
                    map[key] = val;
                    if (this.indices[key] === undefined) {
                        this.indices[key] = this.length;
                        this.__proto__.push.call(this, val);
                    }
                    else {
                        this[this.indices[key]] = val;
                    }
                }
            },
            push: {
                enumerable: false,
                writable: true,
                configurable: true,
                value(val) {
                    this.assign(this.length, val);
                }
            }
        });


        for (var i in obj) {
            this.assign(i, obj[i]);
        }
    }
}