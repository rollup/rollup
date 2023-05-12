define(['exports', 'external'], (function (exports, external) { 'use strict';

	console.log('other');

	console.log('main');

	Object.defineProperty(exports, 'bar', {
		enumerable: true,
		get: function () { return external.bar; }
	});

}));
