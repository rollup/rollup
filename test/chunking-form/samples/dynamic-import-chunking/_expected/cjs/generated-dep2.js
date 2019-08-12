'use strict';

var dep4 = require('./generated-dep4.js');

function mult (num) {
  return num + dep4.multiplier;
}

exports.mult = mult;
