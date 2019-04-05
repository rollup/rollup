'use strict';

require('external');
require('./other.js');
var __chunk_2 = require('./_virtual/_commonjs-external-external');
var __chunk_3 = require('./_virtual/other.js');

const { value } = __chunk_3.default;

console.log(__chunk_2.default, value);

var commonjs = 42;

exports.__moduleExports = commonjs;
exports.default = commonjs;
