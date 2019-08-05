'use strict';

var dep1 = require('./generated-chunk.js');
var dep2 = require('./generated-chunk2.js');

console.log(dep1.num + dep2.num);
