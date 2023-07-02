'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');



exports.default = external;
Object.keys(external).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return external[k]; }
	});
});
