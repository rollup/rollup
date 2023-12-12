'use strict';

var externalAll = require('external-all');
var externalDefault = require('external-default');
var externalDefaultNamed = require('external-default-named');
var externalDefaultNamespace = require('external-default-namespace');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var externalAll__default = /*#__PURE__*/_interopDefaultCompat(externalAll);
var externalDefault__default = /*#__PURE__*/_interopDefaultCompat(externalDefault);
var externalDefaultNamed__default = /*#__PURE__*/_interopDefaultCompat(externalDefaultNamed);
var externalDefaultNamespace__default = /*#__PURE__*/_interopDefaultCompat(externalDefaultNamespace);



Object.defineProperty(exports, "foo", {
	enumerable: true,
	get: function () { return externalAll__default.default; }
});
Object.defineProperty(exports, "bar", {
	enumerable: true,
	get: function () { return externalDefault__default.default; }
});
Object.defineProperty(exports, "baz", {
	enumerable: true,
	get: function () { return externalDefaultNamed__default.default; }
});
Object.defineProperty(exports, "quux", {
	enumerable: true,
	get: function () { return externalDefaultNamespace__default.default; }
});
