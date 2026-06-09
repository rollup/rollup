'use strict';

var c = require('./generated-c.js');
require('./generated-c2.js');
require('./generated-c3.js');
require('./generated-c4.js');
require('./generated-e.js');

console.log('a');
const a = 'a' + c.c;

exports.a = a;
