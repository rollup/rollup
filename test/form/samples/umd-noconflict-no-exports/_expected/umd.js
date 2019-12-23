(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, (function () {
		var current = global.FooBar;
		var exports = global.FooBar = {};
		factory(exports);
		exports.noConflict = function () { global.FooBar = current; return exports; };
	}()));
}(this, (function (exports) { 'use strict';

	console.log('no exports');

})));
