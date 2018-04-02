(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.foo = global.foo || {})));
}(this, (function (exports) { 'use strict';

	const answer = 42;

	exports.answer = answer;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
