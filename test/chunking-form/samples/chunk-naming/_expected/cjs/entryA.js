'use strict';

var dep1 = require('./chunks/chunk.js');
var dep2 = require('./chunks/chunk2.js');

console.log(dep1.num + dep2.num);
