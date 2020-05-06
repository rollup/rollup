'use strict';

var dep = require('./generated-dep.js');

Promise.resolve().then(function () { return require('./generated-dynamic.js'); });
console.log('shared', dep.value1);
