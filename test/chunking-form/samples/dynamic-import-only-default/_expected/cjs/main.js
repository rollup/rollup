'use strict';

function _interopNamespaceDefaultOnly(e) {
	return Object.freeze(Object.defineProperty({__proto__: null, 'default': e}, '__esModule', { value: true }));
}

var main = Promise.all([Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./entry.js')); }), Promise.resolve().then(function () { return require('./generated-other.js'); })]);

module.exports = main;
