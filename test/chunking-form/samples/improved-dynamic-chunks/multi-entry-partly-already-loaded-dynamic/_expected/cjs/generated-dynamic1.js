'use strict';

var main1 = require('./main1.js');
require('./generated-dep2.js');

console.log('dynamic1', main1.value1);

exports.value1 = main1.value1;
