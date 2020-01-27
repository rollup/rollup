'use strict';

var main = require('./generated-main.js');

function mult (num) {
  return num + main.multiplier;
}

exports.mult = mult;
