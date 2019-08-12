'use strict';

var dep2 = require('./chunks/chunk2.js');
var dep3 = require('./chunks/chunk3.js');

console.log(dep2.num + dep3.num);
