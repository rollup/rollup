(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.myModule = {})));
}(this, (function (exports) { 'use strict';

	exports.Foo = class Foo {};
	exports.Foo = lol( exports.Foo );

	Object.defineProperty(exports, '__esModule', { value: true });

})));
