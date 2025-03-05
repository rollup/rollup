'use strict';

var noDependencies = require('./generated-no-dependencies.js');

console.log('from import:', noDependencies.default);

exports.default = noDependencies.default;
