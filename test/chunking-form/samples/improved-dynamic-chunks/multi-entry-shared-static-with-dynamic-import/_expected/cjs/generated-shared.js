'use strict';

const value1 = 'dep';

Promise.resolve().then(function () { return require('./generated-dynamic.js'); });
console.log('shared', value1);

exports.value1 = value1;
