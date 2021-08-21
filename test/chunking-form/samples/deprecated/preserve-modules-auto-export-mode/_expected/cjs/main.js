'use strict';

var _default = require('./default.js');
var named = require('./named.js');

function _interopNamespaceDefaultOnly (e) { return Object.freeze({ __proto__: null, 'default': e }); }

console.log(_default, named.value);

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('./default.js')); }).then(result => console.log(result.default));
Promise.resolve().then(function () { return require('./named.js'); }).then(result => console.log(result.value));

module.exports = _default;
