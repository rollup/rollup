define(['exports', 'external1', 'external2'], (function (exports, external1, external2) { 'use strict';



	Object.defineProperty(exports, "foo", {
		enumerable: true,
		get: function () { return external1.foo; }
	});
	Object.defineProperty(exports, "bar", {
		enumerable: true,
		get: function () { return external2.foo; }
	});

}));
