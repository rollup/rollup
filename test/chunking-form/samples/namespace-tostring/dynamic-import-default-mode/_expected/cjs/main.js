'use strict';

function _interopNamespaceDefaultOnly (e) { return Object.freeze(Object.defineProperty(/*#__PURE__*/Object.setPrototypeOf({ default: e }, null), Symbol.toStringTag, { value: 'Module' })); }

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./foo.js')); }).then(console.log);
