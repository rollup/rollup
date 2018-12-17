(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global['module-name-with-dashes'] = global['module-name-with-dashes'] || {}));
}(this, function (exports) { 'use strict';

	let foo = 'foo';

	exports.foo = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
