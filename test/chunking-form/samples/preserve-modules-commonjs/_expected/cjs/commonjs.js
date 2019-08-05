'use strict';

require('external');
require('./other.js');
var _external_commonjsExternal = require('./_virtual/_external_commonjs-external');
var other$1 = require('./_virtual/other.js_commonjs-proxy');

const { value } = other$1.default;

console.log(_external_commonjsExternal.default, value);

var commonjs = 42;

exports.__moduleExports = commonjs;
exports.default = commonjs;
