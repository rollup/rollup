'use strict';

var dep2 = require('./generated-dep2.js');

console.log('dynamic2', dep2.value2);

exports.value2 = dep2.value2;
