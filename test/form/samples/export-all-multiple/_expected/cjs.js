'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var foo = require('foo');
var bar = require('bar');
var baz = require('baz');



Object.keys(foo).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return foo[k];
		}
	});
});
Object.keys(bar).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return bar[k];
		}
	});
});
Object.keys(baz).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return baz[k];
		}
	});
});
