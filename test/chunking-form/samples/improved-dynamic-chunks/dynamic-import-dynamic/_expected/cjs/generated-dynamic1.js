'use strict';

const value = 'shared';

console.log('dynamic1', value);
new Promise(function (resolve) { resolve(require('./generated-dynamic2.js')); });

exports.value = value;
