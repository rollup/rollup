(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, (function () {
		var current = global.my && global.my.name && global.my.name.spaced && global.my.name.spaced.module;
		var exports = (global.my = global.my || {}, global.my.name = global.my.name || {}, global.my.name.spaced = global.my.name.spaced || {}, global.my.name.spaced.module = {});
		factory(exports);
		exports.noConflict = function () { global.my.name.spaced.module = current; return exports; };
	})());
})(this, (function (exports) { 'use strict';

	function doThings() {
		console.log( 'doing things...' );
	}

	const number = 42;

	var setting = 'no';

	exports.doThings = doThings;
	exports.number = number;
	exports.setting = setting;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
