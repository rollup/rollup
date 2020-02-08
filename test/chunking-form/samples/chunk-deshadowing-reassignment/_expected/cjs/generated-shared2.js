'use strict';

var dep1 = require('./generated-dep1.js');
var dep2 = require('./generated-dep2.js');

var x = dep1.x + 1;
console.log('shared1');

var y = dep2.x + 1;
console.log('shared2');

exports.x = x;
exports.y = y;
