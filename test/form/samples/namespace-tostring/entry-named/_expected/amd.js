define(['exports'], (function (exports) { 'use strict';

	const foo = 42;
	var main = 43;

	exports.default = main;
	exports.foo = foo;

	Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });

}));
