(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory((global.myBundle = {}));
}(this, function (exports) { 'use strict';

	exports.foo = 42;

	exports.bar = 43;
	exports.baz = 44;

}));
