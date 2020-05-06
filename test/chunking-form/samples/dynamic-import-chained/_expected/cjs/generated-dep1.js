'use strict';

console.log('dep1');
Promise.resolve().then(function () { return require('./generated-dep2.js'); });
