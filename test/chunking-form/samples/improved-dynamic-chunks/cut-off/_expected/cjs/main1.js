'use strict';

var dep = require('./generated-dep.js');

console.log('main1', dep.value);
Promise.resolve().then(function () { return require('./generated-dynamic1.js'); });
