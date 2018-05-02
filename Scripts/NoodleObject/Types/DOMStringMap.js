DOMStringMap.prototype.__proto__ = Object.prototype;
DOMStringMap.prototype.constructor = function (doc=document) {
	return doc.createElement('div').dataset;
}
DOMStringMap.__proto__ = Object;