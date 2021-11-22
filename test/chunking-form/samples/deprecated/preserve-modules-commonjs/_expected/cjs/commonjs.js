'use strict';

var require$$0 = require('external');
require('./other.js');
var other = require('./_virtual/other.js_commonjs-exports.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

const external = require$$0__default["default"];
const { value } = other.__exports;

console.log(external, value);

var commonjs = 42;

module.exports = commonjs;
