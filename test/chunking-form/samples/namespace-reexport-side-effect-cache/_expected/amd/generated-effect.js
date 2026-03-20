define(['exports'], (function (exports) { 'use strict';

	const foo = 'foo';

	console.log('side effect');

	exports.foo = foo;

}));
