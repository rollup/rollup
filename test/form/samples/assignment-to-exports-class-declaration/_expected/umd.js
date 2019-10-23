(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.myModule = {}));
}(this, (function (exports) { 'use strict';

	exports.Foo = class Foo {};
	exports.Foo = lol( exports.Foo );

	Object.defineProperty(exports, '__esModule', { value: true });

})));
