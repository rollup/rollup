'use strict';

var dep1 = require('./chunks/chunk.d.ts');
var dep3 = require('./chunks/chunk3.d.ts');

console.log(dep1.num + dep3.num);
