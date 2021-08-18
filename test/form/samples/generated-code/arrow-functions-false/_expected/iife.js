var bundle = (function (exports, external) {
	'use strict';

	exports.a = void 0;

	({a: exports.a} = external.b);
	console.log({a: exports.a} = external.b);

	import('external').then(console.log);

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, external);
