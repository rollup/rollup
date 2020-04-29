'use strict';

var shared = require('./generated-shared.js');

var main1 = shared.data.map(d => d + 1);

module.exports = main1;
