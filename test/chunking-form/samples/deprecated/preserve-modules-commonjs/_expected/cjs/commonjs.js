'use strict';

var _commonjsHelpers = require('./_virtual/_commonjsHelpers.js');
var require$$0 = require('external');
require('./other.js');
var other = require('./_virtual/other.js');

const external = require$$0;
const { value } = other.__exports;

console.log(external, value);

var commonjs = 42;

var value$1 = /*@__PURE__*/_commonjsHelpers.getDefaultExportFromCjs(commonjs);

module.exports = value$1;
