'use strict';

var dep1 = require('./generated-chunk.js');
var dep2 = require('./generated-chunk2.js');

var main1 = dep1.x + dep2.y;

module.exports = main1;
