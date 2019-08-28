define(['exports', 'external1', 'external2'], function (exports, external1, external2) { 'use strict';



	Object.defineProperty(exports, 'x', {
		enumerable: true,
		get: function () {
			return external1.x;
		}
	});
	exports.ext = external2;

	Object.defineProperty(exports, '__esModule', { value: true });

});
