'use strict';

var fooAuto = require('external-auto');
var fooDefault = require('external-default');
var fooDefaultOnly = require('external-defaultOnly');
var fooEsModule = require('external-esModule');

function _interopDefault (e) { return e && e.__esModule ? e["default"] : e; }

function _interopNamespaceDefaultOnly (e) { return Object.freeze({ __proto__: null, 'default': e }); }

function _interopNamespaceDefault(e) {
	var n = Object.create(null);
	if (e) {
		for (var k in e) {
			n[k] = e[k];
		}
	}
	n["default"] = e;
	return Object.freeze(n);
}

function _interopNamespace (e) { return e && e.__esModule ? e : _interopNamespaceDefault(e); }

var fooAuto__default = /*#__PURE__*/_interopDefault(fooAuto);
var fooAuto__namespace = /*#__PURE__*/_interopNamespace(fooAuto);
var fooDefault__namespace = /*#__PURE__*/_interopNamespaceDefault(fooDefault);
var fooDefaultOnly__namespace = /*#__PURE__*/_interopNamespaceDefaultOnly(fooDefaultOnly);

console.log(fooAuto__default, fooAuto.barAuto, fooAuto__namespace);
console.log(fooDefault, fooDefault.barDefault, fooDefault__namespace);
console.log(fooDefaultOnly, fooDefaultOnly__namespace);
console.log(fooEsModule["default"], fooEsModule.barEsModule, fooEsModule);

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('external-auto')); }).then(console.log);
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require('external-default')); }).then(console.log);
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('external-defaultOnly')); }).then(console.log);
Promise.resolve().then(function () { return require('external-esModule'); }).then(console.log);
