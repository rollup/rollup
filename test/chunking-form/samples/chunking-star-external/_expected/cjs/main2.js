'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var starexternal2 = require('starexternal2');
var external2 = require('external2');
var dep = require('./generated-dep.js');

var main = '2';

Object.keys(starexternal2).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return starexternal2[k];
		}
	});
});
Object.defineProperty(exports, 'e', {
	enumerable: true,
	get: function () {
		return external2.e;
	}
});
exports.dep = dep.dep;
exports.main = main;
