'use strict';

var dep2 = require('./v1.0/chunk2.d.ts');
var dep3 = require('./v1.0/chunk3.d.ts');

console.log(dep2.num + dep3.num);
