'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopNamespace(e) {
	if (e && e.__esModule) { return e; } else {
		var n = {};
		if (e) {
			Object.keys(e).forEach(function (k) {
				n[k] =e [k];
			});
		}
		n['default'] = e;
		return n;
	}
}

var external1 = require('external1');
var external2 = require('external2');

const dynamic = new Promise(function (resolve) { resolve(_interopNamespace(require('external3'))); });

Object.keys(external2).forEach(function (k) {
	if (k !== 'default') exports[k] = external2[k];
});
exports.external1 = external1.external1;
exports.dynamic = dynamic;
