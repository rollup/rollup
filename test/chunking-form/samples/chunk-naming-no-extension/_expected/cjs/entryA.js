'use strict';

var dep1 = require('./chunk');
var dep2 = require('./chunk2');

console.log(dep1.num + dep2.num);
