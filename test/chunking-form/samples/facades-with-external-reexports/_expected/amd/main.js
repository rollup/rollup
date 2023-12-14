define(['exports', './other', 'external'], (function (exports, other, external) { 'use strict';



	Object.defineProperty(exports, "foo", {
		enumerable: true,
		get: function () { return external.foo; }
	});

}));
