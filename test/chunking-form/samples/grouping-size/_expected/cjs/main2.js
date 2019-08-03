'use strict';

var dep1 = require('./generated-dep1.js');
var dep2 = require('./generated-dep3.js');

var main2 = dep1.x + dep2.z;

module.exports = main2;
