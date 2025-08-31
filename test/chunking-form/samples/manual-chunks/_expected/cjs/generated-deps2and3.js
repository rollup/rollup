'use strict';

var main = require('./generated-main.js');
var lib1 = require('./generated-lib1.js');

function fn$1 () {
  main.fn();
  console.log('dep2 fn');
}

function fn () {
  lib1.fn();
  console.log('dep3 fn');
}

exports.fn = fn$1;
exports.fn$1 = fn;
