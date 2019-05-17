'use strict';

console.log('dep1');
Promise.resolve(require('./generated-dep2.js'));
