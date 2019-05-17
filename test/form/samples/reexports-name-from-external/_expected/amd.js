define(['exports', 'external'], function (exports, external) { 'use strict';



	Object.defineProperty(exports, 'foo', {
		enumerable: true,
		get: function () {
			return external.foo;
		}
	});

	Object.defineProperty(exports, '__esModule', { value: true });

});
