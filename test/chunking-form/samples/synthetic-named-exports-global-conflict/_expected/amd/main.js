define(['exports'], function (exports) { 'use strict';

	var dep = { foo: 'bar' };
	// This should log a global variable
	console.log(foo);

	exports.foo = dep.foo;

	Object.defineProperty(exports, '__esModule', { value: true });

});
