(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bundle = factory());
})(this, (function () { 'use strict';

	class main {
		constructor() {
			console.log('class');
		}
	}

	return main;

}));
