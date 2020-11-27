'use strict';

function _interopNamespaceDefaultOnly(e) {
	return Object.freeze({__proto__: null, 'default': e});
}

console.log('main');
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./entry-deb-cjs.js')); }).then(console.log);
