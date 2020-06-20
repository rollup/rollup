define(['exports'], function (exports) { 'use strict';

	const foo = 1;

	exports.bar = foo;
	exports.foo = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

});
