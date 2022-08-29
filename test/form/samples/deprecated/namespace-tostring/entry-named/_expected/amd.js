define(['exports'], (function (exports) { 'use strict';

	const foo = 42;

	exports.foo = foo;

	Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

}));
