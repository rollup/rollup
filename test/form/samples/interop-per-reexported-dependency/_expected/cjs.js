'use strict';

var externalAuto = require('external-auto');
var externalDefault = require('external-default');
var externalDefaultOnly = require('external-defaultOnly');
var externalEsModule = require('external-esModule');

function _interopNamespaceDefault(e) {
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n.default = e;
	return Object.freeze(n);
}

function _interopNamespace (e) { return e && e.__esModule ? e : _interopNamespaceDefault(e); }

var externalAuto__namespace = /*#__PURE__*/_interopNamespace(externalAuto);
var externalDefault__namespace = /*#__PURE__*/_interopNamespaceDefault(externalDefault);



Object.defineProperty(exports, "barAuto", {
	enumerable: true,
	get: function () { return externalAuto.barAuto; }
});
exports.externalAuto = externalAuto__namespace;
Object.defineProperty(exports, "fooAuto", {
	enumerable: true,
	get: function () { return externalAuto__namespace.default; }
});
Object.defineProperty(exports, "barDefault", {
	enumerable: true,
	get: function () { return externalDefault.barDefault; }
});
exports.externalDefault = externalDefault__namespace;
exports.fooDefault = externalDefault;
exports.fooDefaultOnly = externalDefaultOnly;
Object.defineProperty(exports, "barEsModule", {
	enumerable: true,
	get: function () { return externalEsModule.barEsModule; }
});
exports.externalEsModule = externalEsModule;
Object.defineProperty(exports, "fooEsModule", {
	enumerable: true,
	get: function () { return externalEsModule.default; }
});
