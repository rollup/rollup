'use strict';

var fooFalse = require('external-false');
var fooTrue = require('external-true');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			n[k] = e[k];
		});
	}
	n['default'] = e;
	return Object.freeze(n);
}

var fooTrue__default = /*#__PURE__*/_interopDefaultLegacy(fooTrue);
var fooTrue__namespace = /*#__PURE__*/_interopNamespace(fooTrue);

console.log(fooFalse, fooFalse.barFalse, fooFalse);
console.log(fooTrue__default, fooTrue.barTrue, fooTrue__namespace);

Promise.resolve().then(function () { return require('external-false'); }).then(console.log);
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('external-true')); }).then(console.log);
