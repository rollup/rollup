'use strict';

var __chunk_1 = require('./lib1-569e10cd.js');

function fn () {
  console.log('lib2 fn');
}

function fn$1 () {
  fn();
  console.log('dep2 fn');
}

function fn$2 () {
  __chunk_1.fn();
  console.log('dep3 fn');
}

exports.fn = fn$1;
exports.fn$1 = fn$2;
