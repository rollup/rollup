'use strict';

function _interopNamespaceDefaultOnly (e) { return Object.freeze(Object.defineProperty({ __proto__: null, default: e }, Symbol.toStringTag, { value: 'Module' })); }

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./foo.js')); }).then(console.log);
