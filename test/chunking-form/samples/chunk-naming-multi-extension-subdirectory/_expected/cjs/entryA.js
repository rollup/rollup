'use strict';

var dep1 = require('./v1.0/chunk.d.ts');
var dep2 = require('./v1.0/chunk2.d.ts');

console.log(dep1.num + dep2.num);
