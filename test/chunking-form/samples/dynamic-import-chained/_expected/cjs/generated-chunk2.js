'use strict';

console.log('dep1');
Promise.resolve(require('./generated-chunk.js'));
