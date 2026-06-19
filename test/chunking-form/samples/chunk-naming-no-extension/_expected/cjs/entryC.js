'use strict';

var dep1 = require('./chunk');
var dep3 = require('./chunk3');

console.log(dep1.num + dep3.num);
