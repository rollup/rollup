'use strict';

var dep = require('./generated-dep.js');

new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); });
console.log('shared', dep.value1);
