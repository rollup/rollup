'use strict';

function _interopNamespaceDefaultOnly (e) { return Object.freeze(/*#__PURE__*/Object.setPrototypeOf({ default: e }, null)); }

var main = Promise.all([Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./entry.js')); }), Promise.resolve().then(function () { return require('./generated-other.js'); })]);

module.exports = main;
