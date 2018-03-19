'use strict';

var __chunk_4 = require('../lib/lib1.js');

function fn () {
  __chunk_4.fn();
  console.log('dep3 fn');
}

exports.fn = fn;
