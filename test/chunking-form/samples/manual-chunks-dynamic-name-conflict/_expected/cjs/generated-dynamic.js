'use strict';

var dynamic2 = require('./generated-dynamic2.js');

console.log('dynamic1');

exports.DYNAMIC_A = dynamic2.DYNAMIC_B;
exports.DYNAMIC_B = dynamic2.DYNAMIC_A;
