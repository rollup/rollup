'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var quoted_external = require('quoted\'external');



Object.keys(quoted_external).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return quoted_external[k];
		}
	});
});
