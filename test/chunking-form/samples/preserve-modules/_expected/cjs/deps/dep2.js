'use strict';

var __chunk_2 = require('../lib/lib2.js');

function fn () {
  __chunk_2.fn();
  console.log('dep2 fn');
}

exports.fn = fn;
