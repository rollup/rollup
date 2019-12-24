(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.myBundle = {}));
}(this, (function (exports) { 'use strict';

	var x = {foo: 'bar'};
	delete x.foo;

	delete globalThis.unknown.foo;

	exports.x = x;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
