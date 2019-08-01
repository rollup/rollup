'use strict';

var broken = require('./generated-chunk.js');
var foo = require('./generated-chunk2.js');

foo.foo();
broken.broken();
