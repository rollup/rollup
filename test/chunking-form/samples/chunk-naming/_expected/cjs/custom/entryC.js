'use strict';

var dep1 = require('../chunks/chunk.js');
var dep3 = require('../chunks/chunk3.js');

console.log(dep1.num + dep3.num);
