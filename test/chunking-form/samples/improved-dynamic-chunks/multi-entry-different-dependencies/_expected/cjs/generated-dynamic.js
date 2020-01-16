'use strict';

var dep1 = require('./generated-dep1.js');
var dep2 = require('./generated-dep2.js');

console.log('dynamic1', dep1.value1, dep2.value2);

exports.value1 = dep1.value1;
exports.value2 = dep2.value2;
