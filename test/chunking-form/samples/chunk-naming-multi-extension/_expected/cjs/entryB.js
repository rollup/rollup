'use strict';

var dep2 = require('./chunks/chunk2.d.ts');
var dep3 = require('./chunks/chunk3.d.ts');

console.log(dep2.num + dep3.num);
