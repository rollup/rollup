define(['exports', 'external1', 'external2'], (function (exports, external1, external2) { 'use strict';

	console.log('shared');

	Object.defineProperty(exports, 'foo', {
		enumerable: true,
		get: function () { return external1.foo; }
	});

}));
