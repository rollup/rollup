define(['exports', 'lib-hooks-a', 'lib-hooks-b'], (function (exports, libHooksA, libHooksB) { 'use strict';



	Object.defineProperty(exports, "hooksA", {
		enumerable: true,
		get: function () { return libHooksA.hooksA; }
	});
	Object.defineProperty(exports, "hooksB", {
		enumerable: true,
		get: function () { return libHooksB.hooksB; }
	});

}));
