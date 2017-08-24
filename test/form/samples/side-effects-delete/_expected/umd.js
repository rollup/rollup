(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.myBundle = {})));
}(this, (function (exports) { 'use strict';

	var x = {foo: 'bar'};
	delete x.foo;

	delete globalVariable.foo;

	exports.x = x;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
