for (var i of Object.getOwnPropertyNames(window)) {
    var c = window[i];
    switch (typeof c) {
        case 'object':
        case 'function':
            if (c !== null)
                for (var j of Object.getOwnPropertyNames(c)) {
                    try {
                        Object.defineProperty(c[j], 'evalableName', {
                            writable: true,
                            configurable: true,
                            enumerable: false,
                            value: 'window["' + i + '"]["' + j + '"]'
                        })
                    }
                    catch (e) { }
                }
    }
    if (typeof c === 'function' && c !== Object) {

        for (var p = c; p !== Object; p = p.__proto__) {
            if (p.__proto__ === Object.__proto__) {
                p.__proto__ = Object;
                break;
            }
        }
    }
}