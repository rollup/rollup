'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var starexternal2 = require('starexternal2');
var external2 = require('external2');
var __chunk_1 = require('./generated-chunk.js');

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
exports.dep = __chunk_1.dep;
exports.main = main;
