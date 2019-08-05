'use strict';

var dep = require('./generated-chunk.js');
require('external');
require('./generated-chunk2.js');

console.log(dep.reexported);
