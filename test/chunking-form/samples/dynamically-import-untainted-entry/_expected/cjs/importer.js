'use strict';

function _interopNamespaceDefaultOnly(e) {
	return Object.freeze(Object.defineProperty({__proto__: null, 'default': e}, '__esModule', { value: true }));
}

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./main.js')); }).then(result => console.log('importer', result));
