'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var externalFalse = require('external-false');
var externalTrue = require('external-true');
var externalAuto = require('external-auto');
var externalDefault = require('external-default');
var externalEsModule = require('external-esModule');

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

var externalTrue__namespace = /*#__PURE__*/_interopNamespace(externalTrue);
var externalTrue__default = /*#__PURE__*/_interopDefaultLegacy(externalTrue);
var externalAuto__namespace = /*#__PURE__*/_interopNamespace(externalAuto);
var externalDefault__namespace = /*#__PURE__*/_interopNamespaceDefault(externalDefault);



Object.defineProperty(exports, 'barFalse', {
	enumerable: true,
	get: function () {
		return externalFalse.barFalse;
	}
});
exports.externalFalse = externalFalse;
exports.fooFalse = externalFalse;
Object.defineProperty(exports, 'barTrue', {
	enumerable: true,
	get: function () {
		return externalTrue.barTrue;
	}
});
exports.externalTrue = externalTrue__namespace;
Object.defineProperty(exports, 'fooTrue', {
	enumerable: true,
	get: function () {
		return externalTrue__default['default'];
	}
});
Object.defineProperty(exports, 'barAuto', {
	enumerable: true,
	get: function () {
		return externalAuto.barAuto;
	}
});
exports.externalAuto = externalAuto__namespace;
Object.defineProperty(exports, 'fooAuto', {
	enumerable: true,
	get: function () {
		return externalAuto__namespace['default'];
	}
});
Object.defineProperty(exports, 'barDefault', {
	enumerable: true,
	get: function () {
		return externalDefault.barDefault;
	}
});
exports.externalDefault = externalDefault__namespace;
exports.fooDefault = externalDefault;
Object.defineProperty(exports, 'barEsModule', {
	enumerable: true,
	get: function () {
		return externalEsModule.barEsModule;
	}
});
exports.externalEsModule = externalEsModule;
Object.defineProperty(exports, 'fooEsModule', {
	enumerable: true,
	get: function () {
		return externalEsModule['default'];
	}
});
