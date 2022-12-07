'use strict';

var dep = require('./generated-dep.js');

console.log('dynamic1', dep.value);
Promise.resolve().then(function () { return require('./generated-dynamic2.js'); });
