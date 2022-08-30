'use strict';

var lib2 = require('../lib/lib2.js');

function fn () {
  lib2.fn();
  console.log('dep2 fn');
}

exports.fn = fn;
