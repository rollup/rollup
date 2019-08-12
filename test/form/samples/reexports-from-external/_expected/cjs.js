'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');



Object.keys(external).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return external[k];
		}
	});
});
