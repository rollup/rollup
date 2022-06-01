'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Bar = function Bar(value) {
	this.x = value;
};
Bar.prototype.value = function value () {
	return this.x;
};
var bar = new Bar(123);
console.log(bar.value());

exports.Bar = Bar;
