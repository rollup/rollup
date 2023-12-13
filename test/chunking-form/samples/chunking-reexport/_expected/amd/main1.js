define(['exports', 'external'], (function (exports, external) { 'use strict';

	console.log('dep');

	Object.defineProperty(exports, "dep", {
		enumerable: true,
		get: function () { return external.asdf; }
	});

}));
