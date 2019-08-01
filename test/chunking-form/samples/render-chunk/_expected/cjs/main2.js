'use strict';

var dep2 = require('./chunk-chunk.js');

var num = 3;

console.log(dep2.num + num);
console.log('fileName', 'main2.js');
console.log('imports', 'chunk-chunk.js');
console.log('isEntry', true);
console.log('name', 'main2');
console.log('modules.length', 2);
