define(['exports', 'external'], function (exports, external) { 'use strict';

	function internalFn(path) {
		return path[0] === '.';
	}

	Object.keys(external).forEach(function (k) {
		if (k !== 'default') Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () {
				return external[k];
			}
		});
	});
	exports.internalFn = internalFn;

	Object.defineProperty(exports, '__esModule', { value: true });

});
