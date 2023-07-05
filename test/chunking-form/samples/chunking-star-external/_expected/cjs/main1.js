'use strict';

var starexternal1 = require('starexternal1');
var external1 = require('external1');
var dep = require('./generated-dep.js');
require('starexternal2');
require('external2');

var main = '1';

Object.defineProperty(exports, 'e', {
	enumerable: true,
	get: function () { return external1.e; }
});
exports.dep = dep.dep;
exports.main = main;
Object.keys(starexternal1).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return starexternal1[k]; }
	});
});
