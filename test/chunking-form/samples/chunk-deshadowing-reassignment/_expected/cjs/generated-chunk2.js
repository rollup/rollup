'use strict';

var dep1 = require('./generated-chunk.js');
var dep2 = require('./generated-chunk3.js');

var x = dep1.x + 1;

var y = dep2.x + 1;

exports.x = x;
exports.y = y;
