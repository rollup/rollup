'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('externalNoImport');
var defaultLegacy = require('external');
var externalAuto = require('externalAuto');
var externalDefault = require('externalDefault');
var externalDefaultOnly = require('externalDefaultOnly');

var _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { 'default': e };

var _interopDefault = e => e && e.__esModule ? e : { 'default': e };

var _interopNamespaceDefaultOnly = e => Object.freeze({ __proto__: null, 'default': e });

function _interopNamespaceDefault(e) {
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(k => {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: () => e[k]
				});
			}
		});
	}
	n["default"] = e;
	return Object.freeze(n);
}

var _interopNamespace = e => e && e.__esModule ? e : _interopNamespaceDefault(e);

function _mergeNamespaces(n, m) {
	m.forEach(e => 
		e && Object.keys(e).forEach(k => {
			if (k !== 'default' && !(k in n)) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: () => e[k]
				});
			}
		})
	);
	return Object.freeze(n);
}

var defaultLegacy__namespace = /*#__PURE__*/_interopNamespace(defaultLegacy);
var defaultLegacy__default = /*#__PURE__*/_interopDefaultLegacy(defaultLegacy);
var externalAuto__default = /*#__PURE__*/_interopDefault(externalAuto);
var externalDefault__namespace = /*#__PURE__*/_interopNamespaceDefault(externalDefault);
var externalDefaultOnly__namespace = /*#__PURE__*/_interopNamespaceDefaultOnly(externalDefaultOnly);

exports.a = void 0;

({ a: exports.a } = defaultLegacy.b);
console.log({ a: exports.a } = defaultLegacy.b);

Promise.resolve().then(() => main).then(console.log);

Promise.resolve().then(() => /*#__PURE__*/_interopNamespace(require('external'))).then(console.log);
console.log(defaultLegacy__default["default"]);
console.log(externalAuto__default["default"]);
console.log(externalDefault__namespace);
console.log(externalDefaultOnly__namespace);

var main = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
	__proto__: null,
	get a () { return exports.a; },
	foo: foo
}, [defaultLegacy__namespace]));

Object.defineProperty(exports, 'foo', {
	enumerable: true,
	get: () => defaultLegacy.foo
});
Object.keys(defaultLegacy).forEach(k => {
	if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: () => defaultLegacy[k]
	});
});
