'use strict';

var shared = require('./generated-shared.js');

shared.commonjsGlobal.fn = d => d + 1;
var cjs = shared.commonjsGlobal.fn;

var main1 = shared.shared.map(cjs);

module.exports = main1;
