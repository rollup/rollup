(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.bundle = factory());
}(this, (function () { 'use strict';

	var main = 42;

	return main;

})));
