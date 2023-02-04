'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');



exports.default = external;
Object.keys(external).forEach(function (k) {
	if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return external[k]; }
	});
});
