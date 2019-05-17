define(['exports', 'external'], function (exports, external) { 'use strict';



	Object.keys(external).forEach(function (key) {
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function () {
				return external[key];
			}
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

});
