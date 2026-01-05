'use strict';

var dep = require('./generated-dep.js');
var starexternal2 = require('starexternal2');
var external2 = require('external2');

var main = '2';

exports.dep = dep.dep;
Object.defineProperty(exports, "e", {
	enumerable: true,
	get: function () { return external2.e; }
});
exports.main = main;
Object.keys(starexternal2).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return starexternal2[k]; }
	});
});
