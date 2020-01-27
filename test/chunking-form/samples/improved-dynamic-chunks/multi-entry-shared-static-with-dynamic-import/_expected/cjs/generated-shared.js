'use strict';

const value1 = 'dep';

new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); });
console.log('shared', value1);

exports.value1 = value1;
