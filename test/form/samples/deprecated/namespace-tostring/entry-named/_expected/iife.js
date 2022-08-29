var bundle = (function (exports) {
	'use strict';

	const foo = 42;

	exports.foo = foo;

	Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

	return exports;

})({});
