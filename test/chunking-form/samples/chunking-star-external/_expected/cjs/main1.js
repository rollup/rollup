'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var starexternal1 = require('starexternal1');
var external1 = require('external1');
require('starexternal2');
require('external2');
var __chunk_1 = require('./generated-chunk.js');

var main = '1';

Object.keys(starexternal1).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return starexternal1[k];
		}
	});
});
Object.defineProperty(exports, 'e', {
	enumerable: true,
	get: function () {
		return external1.e;
	}
});
exports.dep = __chunk_1.dep;
exports.main = main;
