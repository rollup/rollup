'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');

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
