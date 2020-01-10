'use strict';

var main1 = require('./main1.js');
var dep2 = require('./generated-dep2.js');

console.log('dynamic1', main1.value1, dep2.value2);

exports.value1 = main1.value1;
exports.value2 = dep2.value2;
