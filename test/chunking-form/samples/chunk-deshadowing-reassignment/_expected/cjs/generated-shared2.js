'use strict';

var dep1 = require('./generated-dep1.js');
var dep2 = require('./generated-dep2.js');

var x = dep1.x + 1;

var y = dep2.x + 1;

exports.x = x;
exports.y = y;
