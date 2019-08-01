'use strict';

var broken = require('./generated-chunk.js');
var foo = require('./generated-chunk2.js');
var bar = require('./generated-chunk3.js');

foo.foo();
broken.broken();
bar.bar();
broken.broken();
