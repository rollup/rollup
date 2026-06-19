'use strict';

var dep1 = require('./v1.0/chunk.d.ts');
var dep3 = require('./v1.0/chunk3.d.ts');

console.log(dep1.num + dep3.num);
