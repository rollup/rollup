'use strict';

var require$$0 = require('external');
require('./other.js');
var other = require('./_virtual/other.js');

const external = require$$0;
const { value } = other.__exports;

console.log(external, value);

var commonjs = 42;

module.exports = commonjs;
