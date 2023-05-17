'use strict';

var main3 = require('./main3.js');
var main4 = require('./main4.js');

var x = main3.x + 1;
console.log('shared1');

var y = main4.x + 1;
console.log('shared2');

exports.x = x;
exports.y = y;
