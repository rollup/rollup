'use strict';

var small = require('./generated-small.js');
var chunk = require('./generated-chunk.js');
require('./generated-effect.js');

console.log(small.small, chunk.big);
