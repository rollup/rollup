'use strict';

var shared = require('./generated-chunk.js');

shared.commonjsGlobal.fn = d => d + 1;
var cjs = shared.commonjsGlobal.fn;

var main1 = shared.d.map(cjs);

module.exports = main1;
