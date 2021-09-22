'use strict';

var external1 = require('external1');
var external2 = require('external2');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var external2__default = /*#__PURE__*/_interopDefaultLegacy(external2);

console.log(external1.foo);

module.exports = external2__default["default"];
