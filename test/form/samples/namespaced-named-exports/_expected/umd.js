(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.foo = global.foo || {}, global.foo.bar = global.foo.bar || {}, global.foo.bar.baz = {})));
}(this, (function (exports) { 'use strict';

	var answer = 42;

	exports.answer = answer;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
