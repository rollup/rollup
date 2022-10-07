var bundle = (function (exports, a, b, c) {
	'use strict';

	console.log(a.a, b.b);

	import('d').then(console.log);

	Object.defineProperty(exports, 'c', {
		enumerable: true,
		get: function () { return c.c; }
	});

	return exports;

})({}, a, b, c);
