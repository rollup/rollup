'use strict';

var dep1 = require('./dep1.js');
var dep2 = require('./dep2.js');

console.log(dep1.missing1, dep2.missing2, dep2.previousShimmedExport);
