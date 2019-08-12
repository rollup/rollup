'use strict';

console.log('dep1');
new Promise(function (resolve) { resolve(require('./generated-dep2.js')); });
