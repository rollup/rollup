'use strict';

var fooFalse = require('external-false');
var fooTrue = require('external-true');
var fooAuto = require('external-auto');
var fooDefault = require('external-default');
var fooDefaultOnly = require('external-defaultOnly');
var fooEsModule = require('external-esModule');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
	return e && e.__esModule ? e : _interopNamespaceDefault(e);
}

function _interopNamespaceDefault(e) {
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () {
						return e[k];
					}
				});
			}
		});
	}
	n['default'] = e;
	return Object.freeze(n);
}

function _interopNamespaceDefaultOnly(e) {
	return Object.freeze({__proto__: null, 'default': e});
}

var fooTrue__default = /*#__PURE__*/_interopDefaultLegacy(fooTrue);
var fooTrue__namespace = /*#__PURE__*/_interopNamespace(fooTrue);
var fooAuto__namespace = /*#__PURE__*/_interopNamespace(fooAuto);
var fooDefault__namespace = /*#__PURE__*/_interopNamespaceDefault(fooDefault);
var fooDefaultOnly__namespace = /*#__PURE__*/_interopNamespaceDefaultOnly(fooDefaultOnly);

console.log(fooFalse, fooFalse.barFalse, fooFalse);
console.log(fooTrue__default['default'], fooTrue.barTrue, fooTrue__namespace);
console.log(fooAuto__namespace['default'], fooAuto.barAuto, fooAuto__namespace);
console.log(fooDefault, fooDefault.barDefault, fooDefault__namespace);
console.log(fooDefaultOnly, fooDefaultOnly__namespace);
console.log(fooEsModule['default'], fooEsModule.barEsModule, fooEsModule);

Promise.resolve().then(function () { return require('external-false'); }).then(console.log);
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('external-true')); }).then(console.log);
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('external-auto')); }).then(console.log);
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require('external-default')); }).then(console.log);
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('external-defaultOnly')); }).then(console.log);
Promise.resolve().then(function () { return require('external-esModule'); }).then(console.log);
