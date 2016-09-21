(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bundle = global.bundle || {})));
}(this, (function (exports) { 'use strict';

	var foo;

	bar();

	function bar() {
		globalSideEffect = true;
	}

	exports.foo = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
