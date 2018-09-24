DOMStringMap.prototype.__proto__ = Object.prototype;
DOMStringMap.prototype.constructor = function (doc = document) {
    return doc.createElement('div').dataset;
};
Object.defineProperty(DOMStringMap.prototype.constructor, 'name', {value: 'DOMStringMap'});
DOMStringMap.__proto__ = Object;