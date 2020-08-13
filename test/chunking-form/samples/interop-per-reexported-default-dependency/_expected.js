'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var externalFalse = require('external-false');
var externalTrue = require('external-true');
var externalDefault = require('external-default');
var externalEsModule = require('external-esModule');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

function _interopNamespace(e) {
	if (e && e.__esModule) { return e; } else {
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(function (k) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () {
						return e[k];
					}
				});
			});
		}
		n['default'] = e;
		return Object.freeze(n);
	}
}

var externalTrue__namespace = /*#__PURE__*/_interopNamespace(externalTrue);
var externalTrue__default = /*#__PURE__*/_interopDefault(externalTrue);
var externalDefault__namespace = /*#__PURE__*/_interopNamespace(externalDefault);



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
