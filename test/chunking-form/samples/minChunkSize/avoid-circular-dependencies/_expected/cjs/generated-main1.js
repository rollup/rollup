'use strict';

var small = require('./generated-small.js');

const result = small.small + '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789';
console.log(result);

const generated = 'generated' + result;

exports.generated = generated;
exports.result = result;
