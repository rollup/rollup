'use strict';

var dep1 = require('./generated-chunk.js');
var dep2 = require('./generated-chunk2.js');

var main2 = dep1.x + dep2.z;

module.exports = main2;
