(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.bundle = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function () { 'use strict';

	class main {
		constructor() {
			console.log('class');
		}
	}

	return main;

})));
