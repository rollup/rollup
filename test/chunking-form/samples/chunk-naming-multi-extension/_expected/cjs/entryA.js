'use strict';

var dep1 = require('./chunks/chunk.d.ts');
var dep2 = require('./chunks/chunk2.d.ts');

console.log(dep1.num + dep2.num);
