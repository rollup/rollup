'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var foo = require('foo');
var bar = require('bar');
var baz = require('baz');



Object.keys(foo).forEach(function (key) {
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function () {
			return foo[key];
		}
	});
});
Object.keys(bar).forEach(function (key) {
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function () {
			return bar[key];
		}
	});
});
Object.keys(baz).forEach(function (key) {
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function () {
			return baz[key];
		}
	});
});
