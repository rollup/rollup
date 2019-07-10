'use strict';

var __chunk_1 = require('./chunk-chunk.js');

var num = 1;

console.log(num + __chunk_1.num);
console.log('fileName', 'main1.js');
console.log('imports', 'chunk-chunk.js');
console.log('isEntry', true);
console.log('name', 'main1');
console.log('modules.length', 2);
