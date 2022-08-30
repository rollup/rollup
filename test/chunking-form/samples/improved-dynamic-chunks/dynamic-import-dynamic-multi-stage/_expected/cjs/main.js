'use strict';

const value = 'shared';

console.log('dynamic1', value);
Promise.resolve().then(function () { return require('./generated-dynamic1.js'); });

exports.value = value;
