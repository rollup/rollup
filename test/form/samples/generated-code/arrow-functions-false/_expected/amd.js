define(['exports'], function (exports) { 'use strict';

	exports.a = void 0;

	({a: exports.a} = someObject);
	console.log({a: exports.a} = someObject);

	Object.defineProperty(exports, '__esModule', { value: true });

});
