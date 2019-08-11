define(['exports', 'external'], function (exports, external) { 'use strict';



	Object.keys(external).forEach(function (k) {
		if (k !== 'default') Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () {
				return external[k];
			}
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

});
