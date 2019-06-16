'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');

function internalFn(path) {
	return path[0] === '.';
}

Object.keys(external).forEach(function (key) {
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function () {
			return external[key];
		}
	});
});
exports.internalFn = internalFn;
