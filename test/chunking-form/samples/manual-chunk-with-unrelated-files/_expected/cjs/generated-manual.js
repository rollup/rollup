'use strict';

var dep2 = require('./generated-dep2.js');

console.log('manual1');
const manual$1 = 'manual1:' + dep2.dep;

console.log('manual2');
const manual = 'manual2:' + dep2.dep$1;

exports.manual = manual$1;
exports.manual$1 = manual;
