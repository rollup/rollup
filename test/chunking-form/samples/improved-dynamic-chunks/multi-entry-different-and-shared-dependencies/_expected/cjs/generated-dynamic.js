'use strict';

var fromMain1AndDynamic = require('./generated-from-main-1-and-dynamic.js');
var fromMain1And2 = require('./generated-from-main-1-and-2.js');

console.log('dynamic1', fromMain1AndDynamic.value1, fromMain1And2.value2);

exports.value1 = fromMain1AndDynamic.value1;
exports.value2 = fromMain1And2.value2;
