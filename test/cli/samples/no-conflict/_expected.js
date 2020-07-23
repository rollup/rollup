(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(function () {
		var current = global.conflictyName;
		var exports = global.conflictyName = factory();
		exports.noConflict = function () { global.conflictyName = current; return exports; };
	}());
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function () { 'use strict';

	var main = {};

	return main;

})));