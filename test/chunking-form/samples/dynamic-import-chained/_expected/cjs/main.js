'use strict';

console.log('main');
new Promise(function (resolve) { resolve(require('./generated-dep1.js')); });
