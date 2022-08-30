'use strict';

const value = 'shared';

console.log('a', value);
Promise.resolve().then(function () { return require('./generated-dynamic.js'); });

console.log('main', value);
Promise.resolve().then(function () { return require('./generated-dynamic.js'); });

exports.value = value;
