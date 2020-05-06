'use strict';

console.log('main');
Promise.resolve().then(function () { return require('./generated-dep1.js'); });
