'use strict';

var lib1 = require('../lib/lib1.js');

function fn () {
  lib1.fn();
  console.log('dep3 fn');
}

exports.fn = fn;
